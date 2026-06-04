import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { Note, Bookmark, Idea, Project, Task, Reminder, VaultItem, Activity, CustomTag } from '../types';

interface TechMemoryContextType {
  user: User | null;
  loadingAuth: boolean;
  online: boolean;
  syncing: boolean;

  notes: Note[];
  bookmarks: Bookmark[];
  ideas: Idea[];
  projects: Project[];
  tasks: Task[];
  reminders: Reminder[];
  vaultItems: VaultItem[];
  activities: Activity[];
  customTags: CustomTag[];

  // Note Actions
  saveNote: (note: Omit<Note, 'userId' | 'date'>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  toggleNoteFavorite: (id: string) => Promise<void>;

  // Bookmark Actions
  saveBookmark: (bookmark: Omit<Bookmark, 'userId' | 'date'>) => Promise<void>;
  deleteBookmark: (id: string) => Promise<void>;

  // Idea Actions
  saveIdea: (idea: Omit<Idea, 'userId' | 'date'>) => Promise<void>;
  deleteIdea: (id: string) => Promise<void>;

  // Project Actions
  saveProject: (project: Omit<Project, 'userId' | 'date'>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  // Task Actions
  saveTask: (task: Omit<Task, 'userId' | 'date' | 'completed'>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskCompleted: (id: string) => Promise<void>;

  // Reminder Actions
  saveReminder: (reminder: Omit<Reminder, 'userId' | 'dateCreated'>) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;

  // Vault Actions
  saveVaultItem: (vaultItem: Omit<VaultItem, 'userId' | 'date'>) => Promise<void>;
  deleteVaultItem: (id: string) => Promise<void>;

  // Custom Tag Actions
  saveCustomTag: (tag: Omit<CustomTag, 'userId' | 'date'>) => Promise<void>;
  deleteCustomTag: (id: string) => Promise<void>;

  // Security Configuration Actions
  securityPin: string;
  lockedItemIds: string[];
  lockedModules: string[];
  saveSecuritySettings: (pin: string, items: string[], modules: string[]) => Promise<void>;
  unlockedItems: string[];
  unlockedModules: string[];
  unlockItem: (id: string, pinCode: string) => boolean;
  unlockModule: (moduleName: string, pinCode: string) => boolean;
  lockItem: (id: string) => void;
  lockModule: (moduleName: string) => void;

  // General Actions
  logActivity: (description: string) => Promise<void>;
  clearAllLocalData: () => void;
  importBackupData: (backup: any) => Promise<void>;
  manualSyncCloud: () => Promise<void>;
}

const TechMemoryContext = createContext<TechMemoryContextType | undefined>(undefined);

export const useTechMemory = () => {
  const context = useContext(TechMemoryContext);
  if (!context) {
    throw new Error('useTechMemory must be used within a TechMemoryProvider');
  }
  return context;
};

export const TechMemoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [online, setOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);

  // States
  const [notes, setNotes] = useState<Note[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [customTags, setCustomTags] = useState<CustomTag[]>([]);

  // Security configuration states loaded from localStorage
  const [securityPin, setSecurityPin] = useState<string>(() => {
    return localStorage.getItem('techmemory_pin') || '';
  });
  const [lockedItemIds, setLockedItemIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('techmemory_locked_item_ids');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [lockedModules, setLockedModules] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('techmemory_locked_modules');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Passive synchronization: watch vaultItems for cloud settings updates
  useEffect(() => {
    const configItem = vaultItems.find(item => item.id === 'security_config_metadata');
    if (configItem) {
      try {
        const parsed = JSON.parse(configItem.content);
        if (parsed) {
          if (typeof parsed.pin === 'string' && parsed.pin !== securityPin) {
            setSecurityPin(parsed.pin);
            localStorage.setItem('techmemory_pin', parsed.pin);
          }
          if (Array.isArray(parsed.lockedItemIds)) {
            const isDifferent = JSON.stringify(parsed.lockedItemIds) !== JSON.stringify(lockedItemIds);
            if (isDifferent) {
              setLockedItemIds(parsed.lockedItemIds);
              localStorage.setItem('techmemory_locked_item_ids', JSON.stringify(parsed.lockedItemIds));
            }
          }
          if (Array.isArray(parsed.lockedModules)) {
            const isDifferent = JSON.stringify(parsed.lockedModules) !== JSON.stringify(lockedModules);
            if (isDifferent) {
              setLockedModules(parsed.lockedModules);
              localStorage.setItem('techmemory_locked_modules', JSON.stringify(parsed.lockedModules));
            }
          }
        }
      } catch (err) {
        console.warn('Error syncing security configuration from vault item:', err);
      }
    }
  }, [vaultItems]);

  // Session lock/unlock states (dynamically reset each session)
  const [unlockedItems, setUnlockedItems] = useState<string[]>([]);
  const [unlockedModules, setUnlockedModules] = useState<string[]>([]);

  const unlockItem = (id: string, pinCode: string): boolean => {
    if (pinCode === securityPin) {
      setUnlockedItems(prev => prev.includes(id) ? prev : [...prev, id]);
      return true;
    }
    return false;
  };

  const unlockModule = (moduleName: string, pinCode: string): boolean => {
    if (pinCode === securityPin) {
      setUnlockedModules(prev => prev.includes(moduleName) ? prev : [...prev, moduleName]);
      return true;
    }
    return false;
  };

  const lockItem = (id: string) => {
    setUnlockedItems(prev => prev.filter(x => x !== id));
  };

  const lockModule = (moduleName: string) => {
    setUnlockedModules(prev => prev.filter(x => x !== moduleName));
  };

  // Update online status
  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Helper inside helper to get local items
  const getLocal = <T,>(key: string): T[] => {
    try {
      const data = localStorage.getItem(`techmemory_${key}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  const setLocal = <T,>(key: string, data: T[]) => {
    localStorage.setItem(`techmemory_${key}`, JSON.stringify(data));
  };

  // Offline-first Deletion Tracking Helpers
  const trackDeletion = (collectionName: string, id: string) => {
    try {
      const stored = localStorage.getItem(`techmemory_deleted_${collectionName}`);
      const list = stored ? JSON.parse(stored) : [];
      if (!list.includes(id)) {
        list.push(id);
        localStorage.setItem(`techmemory_deleted_${collectionName}`, JSON.stringify(list));
      }
    } catch (e) {
      console.warn('Error tracking deletion:', e);
    }
  };

  const getDeletedIds = (collectionName: string): string[] => {
    try {
      const stored = localStorage.getItem(`techmemory_deleted_${collectionName}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const clearDeletedIds = (collectionName: string, idsToRemove: string[]) => {
    try {
      const stored = localStorage.getItem(`techmemory_deleted_${collectionName}`);
      let list = stored ? JSON.parse(stored) : [];
      list = list.filter((id: string) => !idsToRemove.includes(id));
      localStorage.setItem(`techmemory_deleted_${collectionName}`, JSON.stringify(list));
    } catch (e) {
      console.warn('Error clearing deleted ids:', e);
    }
  };

  // Load offline data first
  const loadOfflineData = () => {
    const deletedNotes = getDeletedIds('notes');
    const deletedBookmarks = getDeletedIds('bookmarks');
    const deletedIdeas = getDeletedIds('ideas');
    const deletedProjects = getDeletedIds('projects');
    const deletedTasks = getDeletedIds('tasks');
    const deletedReminders = getDeletedIds('reminders');
    const deletedVault = getDeletedIds('vault');
    const deletedActivities = getDeletedIds('activity');
    const deletedCustomTags = getDeletedIds('customtags');

    setNotes(getLocal<Note>('notes').filter(n => !deletedNotes.includes(n.id)));
    setBookmarks(getLocal<Bookmark>('bookmarks').filter(b => !deletedBookmarks.includes(b.id)));
    setIdeas(getLocal<Idea>('ideas').filter(i => !deletedIdeas.includes(i.id)));
    setProjects(getLocal<Project>('projects').filter(p => !deletedProjects.includes(p.id)));
    setTasks(getLocal<Task>('tasks').filter(t => !deletedTasks.includes(t.id)));
    setReminders(getLocal<Reminder>('reminders').filter(r => !deletedReminders.includes(r.id)));
    setVaultItems(getLocal<VaultItem>('vault').filter(v => !deletedVault.includes(v.id)));
    setActivities(getLocal<Activity>('activities').filter(a => !deletedActivities.includes(a.id)));
    setCustomTags(getLocal<CustomTag>('customtags').filter(t => !deletedCustomTags.includes(t.id)));
  };

  // Safe fetch from Firestore for logged in user
  const fetchCloudCollection = async <T,>(collectionName: string): Promise<T[]> => {
    if (!auth.currentUser) return [];
    try {
      const colRef = collection(db, collectionName);
      const q = query(colRef, where('userId', '==', auth.currentUser.uid));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as T);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, collectionName);
      return [];
    }
  };

  // Cloud synchronization logic merging local + remote
  const syncWithCloud = async () => {
    if (!auth.currentUser || !online) return;
    setSyncing(true);
    try {
      // 1. NOTES
      const deletedNotes = getDeletedIds('notes');
      if (deletedNotes.length > 0) {
        for (const id of deletedNotes) {
          await deleteDoc(doc(db, 'notes', id)).catch(() => {});
        }
        clearDeletedIds('notes', deletedNotes);
      }
      const cloudNotesRaw = await fetchCloudCollection<Note>('notes');
      const cloudNotes = cloudNotesRaw.filter(n => !getDeletedIds('notes').includes(n.id));
      const localNotes = getLocal<Note>('notes').filter(n => !getDeletedIds('notes').includes(n.id));
      const mergedNotes = mergeCollections(localNotes, cloudNotes, 'date');
      setNotes(mergedNotes);
      setLocal('notes', mergedNotes);
      await uploadDiff(mergedNotes, cloudNotes, 'notes');

      // 2. BOOKMARKS
      const deletedBookmarks = getDeletedIds('bookmarks');
      if (deletedBookmarks.length > 0) {
        for (const id of deletedBookmarks) {
          await deleteDoc(doc(db, 'bookmarks', id)).catch(() => {});
        }
        clearDeletedIds('bookmarks', deletedBookmarks);
      }
      const cloudBookmarksRaw = await fetchCloudCollection<Bookmark>('bookmarks');
      const cloudBookmarks = cloudBookmarksRaw.filter(b => !getDeletedIds('bookmarks').includes(b.id));
      const localBookmarks = getLocal<Bookmark>('bookmarks').filter(b => !getDeletedIds('bookmarks').includes(b.id));
      const mergedBookmarks = mergeCollections(localBookmarks, cloudBookmarks, 'date');
      setBookmarks(mergedBookmarks);
      setLocal('bookmarks', mergedBookmarks);
      await uploadDiff(mergedBookmarks, cloudBookmarks, 'bookmarks');

      // 3. IDEAS
      const deletedIdeas = getDeletedIds('ideas');
      if (deletedIdeas.length > 0) {
        for (const id of deletedIdeas) {
          await deleteDoc(doc(db, 'ideas', id)).catch(() => {});
        }
        clearDeletedIds('ideas', deletedIdeas);
      }
      const cloudIdeasRaw = await fetchCloudCollection<Idea>('ideas');
      const cloudIdeas = cloudIdeasRaw.filter(i => !getDeletedIds('ideas').includes(i.id));
      const localIdeas = getLocal<Idea>('ideas').filter(i => !getDeletedIds('ideas').includes(i.id));
      const mergedIdeas = mergeCollections(localIdeas, cloudIdeas, 'date');
      setIdeas(mergedIdeas);
      setLocal('ideas', mergedIdeas);
      await uploadDiff(mergedIdeas, cloudIdeas, 'ideas');

      // 4. PROJECTS
      const deletedProjects = getDeletedIds('projects');
      if (deletedProjects.length > 0) {
        for (const id of deletedProjects) {
          await deleteDoc(doc(db, 'projects', id)).catch(() => {});
        }
        clearDeletedIds('projects', deletedProjects);
      }
      const cloudProjectsRaw = await fetchCloudCollection<Project>('projects');
      const cloudProjects = cloudProjectsRaw.filter(p => !getDeletedIds('projects').includes(p.id));
      const localProjects = getLocal<Project>('projects').filter(p => !getDeletedIds('projects').includes(p.id));
      const mergedProjects = mergeCollections(localProjects, cloudProjects, 'date');
      setProjects(mergedProjects);
      setLocal('projects', mergedProjects);
      await uploadDiff(mergedProjects, cloudProjects, 'projects');

      // 5. TASKS
      const deletedTasks = getDeletedIds('tasks');
      if (deletedTasks.length > 0) {
        for (const id of deletedTasks) {
          await deleteDoc(doc(db, 'tasks', id)).catch(() => {});
        }
        clearDeletedIds('tasks', deletedTasks);
      }
      const cloudTasksRaw = await fetchCloudCollection<Task>('tasks');
      const cloudTasks = cloudTasksRaw.filter(t => !getDeletedIds('tasks').includes(t.id));
      const localTasks = getLocal<Task>('tasks').filter(t => !getDeletedIds('tasks').includes(t.id));
      const mergedTasks = mergeCollections(localTasks, cloudTasks, 'date');
      setTasks(mergedTasks);
      setLocal('tasks', mergedTasks);
      await uploadDiff(mergedTasks, cloudTasks, 'tasks');

      // 6. REMINDERS
      const deletedReminders = getDeletedIds('reminders');
      if (deletedReminders.length > 0) {
        for (const id of deletedReminders) {
          await deleteDoc(doc(db, 'reminders', id)).catch(() => {});
        }
        clearDeletedIds('reminders', deletedReminders);
      }
      const cloudRemindersRaw = await fetchCloudCollection<Reminder>('reminders');
      const cloudReminders = cloudRemindersRaw.filter(r => !getDeletedIds('reminders').includes(r.id));
      const localReminders = getLocal<Reminder>('reminders').filter(r => !getDeletedIds('reminders').includes(r.id));
      const mergedReminders = mergeCollections(localReminders, cloudReminders, 'dateCreated');
      setReminders(mergedReminders);
      setLocal('reminders', mergedReminders);
      await uploadDiff(mergedReminders, cloudReminders, 'reminders');

      // 7. VAULT
      const deletedVault = getDeletedIds('vault');
      if (deletedVault.length > 0) {
        for (const id of deletedVault) {
          await deleteDoc(doc(db, 'vault', id)).catch(() => {});
        }
        clearDeletedIds('vault', deletedVault);
      }
      const cloudVaultRaw = await fetchCloudCollection<VaultItem>('vault');
      const cloudVault = cloudVaultRaw.filter(v => !getDeletedIds('vault').includes(v.id));
      const localVault = getLocal<VaultItem>('vault').filter(v => !getDeletedIds('vault').includes(v.id));
      const mergedVault = mergeCollections(localVault, cloudVault, 'date');
      setVaultItems(mergedVault);
      setLocal('vault', mergedVault);
      await uploadDiff(mergedVault, cloudVault, 'vault');

      // 8. ACTIVITIES
      const deletedActivities = getDeletedIds('activity');
      if (deletedActivities.length > 0) {
        for (const id of deletedActivities) {
          await deleteDoc(doc(db, 'activity', id)).catch(() => {});
        }
        clearDeletedIds('activity', deletedActivities);
      }
      const cloudActsRaw = await fetchCloudCollection<Activity>('activity');
      const cloudActs = cloudActsRaw.filter(a => !getDeletedIds('activity').includes(a.id));
      const localActs = getLocal<Activity>('activities').filter(a => !getDeletedIds('activity').includes(a.id));
      const mergedActs = mergeCollections(localActs, cloudActs, 'date');
      setActivities(mergedActs);
      setLocal('activities', mergedActs);
      await uploadDiff(mergedActs, cloudActs, 'activity');

      // 9. CUSTOM TAGS
      const deletedCustomTags = getDeletedIds('customtags');
      if (deletedCustomTags.length > 0) {
        for (const id of deletedCustomTags) {
          await deleteDoc(doc(db, 'customtags', id)).catch(() => {});
        }
        clearDeletedIds('customtags', deletedCustomTags);
      }
      const cloudCustomTagsRaw = await fetchCloudCollection<CustomTag>('customtags');
      const cloudCustomTags = cloudCustomTagsRaw.filter(t => !getDeletedIds('customtags').includes(t.id));
      const localCustomTags = getLocal<CustomTag>('customtags').filter(t => !getDeletedIds('customtags').includes(t.id));
      const mergedCustomTags = mergeCollections(localCustomTags, cloudCustomTags, 'date');
      setCustomTags(mergedCustomTags);
      setLocal('customtags', mergedCustomTags);
      await uploadDiff(mergedCustomTags, cloudCustomTags, 'customtags');

    } catch (e) {
      console.warn('Sync warning:', e);
    } finally {
      setSyncing(false);
    }
  };

  // Dynamic collection merger choosing most recent date
  const mergeCollections = <T extends { id: string }>(local: T[], remote: T[], dateField: keyof T): T[] => {
    const map = new Map<string, T>();
    local.forEach(item => map.set(item.id, item));
    remote.forEach(item => {
      const existing = map.get(item.id);
      if (!existing) {
        map.set(item.id, item);
      } else {
        const localDate = new Date(existing[dateField] as unknown as string).getTime();
        const remoteDate = new Date(item[dateField] as unknown as string).getTime();
        if (remoteDate > localDate) {
          map.set(item.id, item);
        }
      }
    });
    return Array.from(map.values());
  };

  // Upload items present locally but out of date or absent in cloud
  const uploadDiff = async <T extends { id: string; userId: string }>(merged: T[], cloud: T[], collectionName: string) => {
    if (!auth.currentUser) return;
    const cloudIds = new Set(cloud.map(c => c.id));
    const toUpload = merged.filter(item => !cloudIds.has(item.id));
    
    if (toUpload.length === 0) return;

    // Use batches for highly performant uploads
    const batch = writeBatch(db);
    let count = 0;
    for (const item of toUpload) {
      const docRef = doc(db, collectionName, item.id);
      batch.set(docRef, { ...item, userId: auth.currentUser.uid });
      count++;
      if (count >= 400) { // Safety limit check (max 500 writes in batch)
        await batch.commit();
        count = 0;
      }
    }
    if (count > 0) {
      await batch.commit();
    }
  };

  // Trigger Auth status change
  useEffect(() => {
    loadOfflineData();
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      setLoadingAuth(false);
      if (fbUser) {
        // Sync local with remote on log in
        await syncWithCloud();
      } else {
        // Fallback to offline defaults
        loadOfflineData();
      }
    });
    return () => unsubscribe();
  }, [online]);

  const manualSyncCloud = async () => {
    if (!auth.currentUser) throw new Error('User not logged in');
    await syncWithCloud();
  };

  // Log activity helper
  const logActivity = async (description: string) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const act: Activity = {
      id,
      description,
      date: new Date().toISOString(),
      userId: user?.uid || 'offline'
    };

    const updated = [act, ...activities].slice(0, 50); // Hard limit log size to 50
    setActivities(updated);
    setLocal('activities', updated);

    if (user && online) {
      try {
        await setDoc(doc(db, 'activity', id), act);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'activity');
      }
    }
  };

  // NOTE ACTIONS
  const saveNote = async (noteData: Omit<Note, 'userId' | 'date'>) => {
    const currentUid = user?.uid || 'offline';
    const note: Note = {
      ...noteData,
      date: new Date().toISOString(),
      userId: currentUid
    };

    const updated = notes.some(n => n.id === note.id)
      ? notes.map(n => n.id === note.id ? note : n)
      : [note, ...notes];

    setNotes(updated);
    setLocal('notes', updated);
    await logActivity(`${notes.some(n => n.id === note.id) ? 'Editou' : 'Criou'} nota: ${note.title}`);

    if (user && online) {
      try {
        await setDoc(doc(db, 'notes', note.id), note);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `notes/${note.id}`);
      }
    }
  };

  const deleteNote = async (id: string) => {
    trackDeletion('notes', id);
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    setLocal('notes', updated);
    await logActivity('Excluiu uma nota');

    if (user && online) {
      try {
        await deleteDoc(doc(db, 'notes', id));
        clearDeletedIds('notes', [id]);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `notes/${id}`);
      }
    }
  };

  const toggleNoteFavorite = async (id: string) => {
    const target = notes.find(n => n.id === id);
    if (!target) return;
    const updatedNote = { ...target, favorite: !target.favorite, date: new Date().toISOString() };
    
    const updated = notes.map(n => n.id === id ? updatedNote : n);
    setNotes(updated);
    setLocal('notes', updated);

    if (user && online) {
      try {
        await setDoc(doc(db, 'notes', id), updatedNote);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `notes/${id}`);
      }
    }
  };

  // BOOKMARK ACTIONS
  const saveBookmark = async (bData: Omit<Bookmark, 'userId' | 'date'>) => {
    const currentUid = user?.uid || 'offline';
    const bookmark: Bookmark = {
      ...bData,
      date: new Date().toISOString(),
      userId: currentUid
    };

    const updated = bookmarks.some(b => b.id === bookmark.id)
      ? bookmarks.map(b => b.id === bookmark.id ? bookmark : b)
      : [bookmark, ...bookmarks];

    setBookmarks(updated);
    setLocal('bookmarks', updated);
    await logActivity(`Adicionou site favorito: ${bookmark.title}`);

    if (user && online) {
      try {
        await setDoc(doc(db, 'bookmarks', bookmark.id), bookmark);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `bookmarks/${bookmark.id}`);
      }
    }
  };

  const deleteBookmark = async (id: string) => {
    trackDeletion('bookmarks', id);
    const updated = bookmarks.filter(b => b.id !== id);
    setBookmarks(updated);
    setLocal('bookmarks', updated);
    await logActivity('Removeu site favorito');

    if (user && online) {
      try {
        await deleteDoc(doc(db, 'bookmarks', id));
        clearDeletedIds('bookmarks', [id]);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `bookmarks/${id}`);
      }
    }
  };

  // IDEA ACTIONS
  const saveIdea = async (iData: Omit<Idea, 'userId' | 'date'>) => {
    const currentUid = user?.uid || 'offline';
    const idea: Idea = {
      ...iData,
      date: new Date().toISOString(),
      userId: currentUid
    };

    const updated = ideas.some(i => i.id === idea.id)
      ? ideas.map(i => i.id === idea.id ? idea : i)
      : [idea, ...ideas];

    setIdeas(updated);
    setLocal('ideas', updated);
    await logActivity(`Salvou ideia de estudo: ${idea.title}`);

    if (user && online) {
      try {
        await setDoc(doc(db, 'ideas', idea.id), idea);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `ideas/${idea.id}`);
      }
    }
  };

  const deleteIdea = async (id: string) => {
    trackDeletion('ideas', id);
    const updated = ideas.filter(i => i.id !== id);
    setIdeas(updated);
    setLocal('ideas', updated);
    await logActivity('Removeu uma ideia');

    if (user && online) {
      try {
        await deleteDoc(doc(db, 'ideas', id));
        clearDeletedIds('ideas', [id]);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `ideas/${id}`);
      }
    }
  };

  // PROJECT ACTIONS
  const saveProject = async (pData: Omit<Project, 'userId' | 'date'>) => {
    const currentUid = user?.uid || 'offline';
    const proj: Project = {
      ...pData,
      date: new Date().toISOString(),
      userId: currentUid
    };

    const updated = projects.some(p => p.id === proj.id)
      ? projects.map(p => p.id === proj.id ? proj : p)
      : [proj, ...projects];

    setProjects(updated);
    setLocal('projects', updated);
    await logActivity(`Registrou projeto: ${proj.name}`);

    if (user && online) {
      try {
        await setDoc(doc(db, 'projects', proj.id), proj);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `projects/${proj.id}`);
      }
    }
  };

  const deleteProject = async (id: string) => {
    trackDeletion('projects', id);
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    setLocal('projects', updated);
    await logActivity('Excluiu um projeto');

    if (user && online) {
      try {
        await deleteDoc(doc(db, 'projects', id));
        clearDeletedIds('projects', [id]);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `projects/${id}`);
      }
    }
  };

  // TASK ACTIONS
  const saveTask = async (tData: Omit<Task, 'userId' | 'date' | 'completed'>) => {
    const currentUid = user?.uid || 'offline';
    const existingTask = tasks.find(t => t.id === tData.id);
    const task: Task = {
      ...tData,
      completed: existingTask ? existingTask.completed : false,
      date: new Date().toISOString(),
      userId: currentUid
    };

    const updated = tasks.some(t => t.id === task.id)
      ? tasks.map(t => t.id === task.id ? task : t)
      : [task, ...tasks];

    setTasks(updated);
    setLocal('tasks', updated);
    await logActivity(`Planejou tarefa: ${task.title}`);

    if (user && online) {
      try {
        await setDoc(doc(db, 'tasks', task.id), task);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `tasks/${task.id}`);
      }
    }
  };

  const deleteTask = async (id: string) => {
    trackDeletion('tasks', id);
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    setLocal('tasks', updated);
    await logActivity('Removeu uma de suas tarefas');

    if (user && online) {
      try {
        await deleteDoc(doc(db, 'tasks', id));
        clearDeletedIds('tasks', [id]);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `tasks/${id}`);
      }
    }
  };

  const toggleTaskCompleted = async (id: string) => {
    const target = tasks.find(t => t.id === id);
    if (!target) return;

    const nextCompleted = !target.completed;
    const updatedTask: Task = {
      ...target,
      completed: nextCompleted,
      status: nextCompleted ? 'Concluído' : 'Pendente',
      date: new Date().toISOString()
    };

    const updated = tasks.map(t => t.id === id ? updatedTask : t);
    setTasks(updated);
    setLocal('tasks', updated);
    await logActivity(nextCompleted ? `Concluiu tarefa: ${target.title}` : `Reabriu tarefa: ${target.title}`);

    if (user && online) {
      try {
        await setDoc(doc(db, 'tasks', id), updatedTask);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `tasks/${id}`);
      }
    }
  };

  // REMINDER ACTIONS
  const saveReminder = async (rData: Omit<Reminder, 'userId' | 'dateCreated'>) => {
    const currentUid = user?.uid || 'offline';
    const rem: Reminder = {
      ...rData,
      dateCreated: new Date().toISOString(),
      userId: currentUid
    };

    const updated = reminders.some(r => r.id === rem.id)
      ? reminders.map(r => r.id === rem.id ? rem : r)
      : [rem, ...reminders];

    setReminders(updated);
    setLocal('reminders', updated);
    await logActivity(`Sinalizou lembrete: ${rem.title}`);

    if (user && online) {
      try {
        await setDoc(doc(db, 'reminders', rem.id), rem);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `reminders/${rem.id}`);
      }
    }
  };

  const deleteReminder = async (id: string) => {
    trackDeletion('reminders', id);
    const updated = reminders.filter(r => r.id !== id);
    setReminders(updated);
    setLocal('reminders', updated);
    await logActivity('Removeu um aviso de lembrete');

    if (user && online) {
      try {
        await deleteDoc(doc(db, 'reminders', id));
        clearDeletedIds('reminders', [id]);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `reminders/${id}`);
      }
    }
  };

  // VAULT ACTIONS
  const saveVaultItem = async (vData: Omit<VaultItem, 'userId' | 'date'>) => {
    const currentUid = user?.uid || 'offline';
    const vault: VaultItem = {
      ...vData,
      date: new Date().toISOString(),
      userId: currentUid
    };

    const updated = vaultItems.some(v => v.id === vault.id)
      ? vaultItems.map(v => v.id === vault.id ? vault : v)
      : [vault, ...vaultItems];

    setVaultItems(updated);
    setLocal('vault', updated);
    await logActivity(`Registrou item no cofre seguro: ${vault.title}`);

    if (user && online) {
      try {
        await setDoc(doc(db, 'vault', vault.id), vault);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `vault/${vault.id}`);
      }
    }
  };

  const deleteVaultItem = async (id: string) => {
    trackDeletion('vault', id);
    const updated = vaultItems.filter(v => v.id !== id);
    setVaultItems(updated);
    setLocal('vault', updated);
    await logActivity('Removeu um item do cofre seguro');

    if (user && online) {
      try {
        await deleteDoc(doc(db, 'vault', id));
        clearDeletedIds('vault', [id]);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `vault/${id}`);
      }
    }
  };

  // CUSTOM TAG ACTIONS
  const saveCustomTag = async (tagData: Omit<CustomTag, 'userId' | 'date'>) => {
    const currentUid = user?.uid || 'offline';
    const tag: CustomTag = {
      ...tagData,
      date: new Date().toISOString(),
      userId: currentUid
    };

    const updated = customTags.some(t => t.id === tag.id)
      ? customTags.map(t => t.id === tag.id ? tag : t)
      : [tag, ...customTags];

    setCustomTags(updated);
    setLocal('customtags', updated);
    await logActivity(`${customTags.some(t => t.id === tag.id) ? 'Editou' : 'Criou'} etiqueta: ${tag.name}`);

    if (user && online) {
      try {
        await setDoc(doc(db, 'customtags', tag.id), tag);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `customtags/${tag.id}`);
      }
    }
  };

  const deleteCustomTag = async (id: string) => {
    trackDeletion('customtags', id);
    const updated = customTags.filter(t => t.id !== id);
    setCustomTags(updated);
    setLocal('customtags', updated);
    await logActivity('Excluiu uma etiqueta customizada');

    if (user && online) {
      try {
        await deleteDoc(doc(db, 'customtags', id));
        clearDeletedIds('customtags', [id]);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `customtags/${id}`);
      }
    }
  };

  // UTILS
  const clearAllLocalData = () => {
    localStorage.removeItem('techmemory_notes');
    localStorage.removeItem('techmemory_bookmarks');
    localStorage.removeItem('techmemory_ideas');
    localStorage.removeItem('techmemory_projects');
    localStorage.removeItem('techmemory_tasks');
    localStorage.removeItem('techmemory_reminders');
    localStorage.removeItem('techmemory_vault');
    localStorage.removeItem('techmemory_activities');
    localStorage.removeItem('techmemory_customtags');
    localStorage.removeItem('techmemory_pin');
    localStorage.removeItem('techmemory_locked_item_ids');
    localStorage.removeItem('techmemory_locked_modules');

    localStorage.removeItem('techmemory_deleted_notes');
    localStorage.removeItem('techmemory_deleted_bookmarks');
    localStorage.removeItem('techmemory_deleted_ideas');
    localStorage.removeItem('techmemory_deleted_projects');
    localStorage.removeItem('techmemory_deleted_tasks');
    localStorage.removeItem('techmemory_deleted_reminders');
    localStorage.removeItem('techmemory_deleted_vault');
    localStorage.removeItem('techmemory_deleted_activity');
    localStorage.removeItem('techmemory_deleted_customtags');
    
    setNotes([]);
    setBookmarks([]);
    setIdeas([]);
    setProjects([]);
    setTasks([]);
    setReminders([]);
    setVaultItems([]);
    setActivities([]);
    setCustomTags([]);
    setSecurityPin('');
    setLockedItemIds([]);
    setLockedModules([]);
  };

  const saveSecuritySettings = async (pin: string, items: string[], modules: string[]) => {
    setSecurityPin(pin);
    setLockedItemIds(items);
    setLockedModules(modules);

    localStorage.setItem('techmemory_pin', pin);
    localStorage.setItem('techmemory_locked_item_ids', JSON.stringify(items));
    localStorage.setItem('techmemory_locked_modules', JSON.stringify(modules));

    // Write a special vault item to sync settings across logins!
    const configPayload = {
      id: 'security_config_metadata',
      title: 'Configurações de Segurança do Sistema',
      type: 'Senha' as const,
      content: JSON.stringify({ pin, lockedItemIds: items, lockedModules: modules })
    };

    // Save under the vault tab so it is saved locally and synced
    const currentUid = user?.uid || 'offline';
    const vaultObj = {
      ...configPayload,
      date: new Date().toISOString(),
      userId: currentUid
    };

    // Directly update local state and call Firestore
    const updatedVault = vaultItems.some(v => v.id === vaultObj.id)
      ? vaultItems.map(v => v.id === vaultObj.id ? vaultObj : v)
      : [vaultObj, ...vaultItems];

    setVaultItems(updatedVault);
    setLocal('vault', updatedVault);
    await logActivity('Alterou as configurações de segurança do cofre');

    if (user && online) {
      try {
        await setDoc(doc(db, 'vault', vaultObj.id), vaultObj);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `vault/${vaultObj.id}`);
      }
    }
  };

  const importBackupData = async (backup: any) => {
    const currentUid = user?.uid || 'offline';
    const timestamp = new Date().toISOString();

    if (Array.isArray(backup.notes)) {
      const sanitized = backup.notes.map((n: any) => ({ ...n, userId: currentUid, date: n.date || timestamp }));
      setNotes(sanitized);
      setLocal('notes', sanitized);
      if (user && online) {
        for (const n of sanitized) await setDoc(doc(db, 'notes', n.id), n).catch(() => {});
      }
    }

    if (Array.isArray(backup.bookmarks)) {
      const sanitized = backup.bookmarks.map((b: any) => ({ ...b, userId: currentUid, date: b.date || timestamp }));
      setBookmarks(sanitized);
      setLocal('bookmarks', sanitized);
      if (user && online) {
        for (const b of sanitized) await setDoc(doc(db, 'bookmarks', b.id), b).catch(() => {});
      }
    }

    if (Array.isArray(backup.ideas)) {
      const sanitized = backup.ideas.map((i: any) => ({ ...i, userId: currentUid, date: i.date || timestamp }));
      setIdeas(sanitized);
      setLocal('ideas', sanitized);
      if (user && online) {
        for (const i of sanitized) await setDoc(doc(db, 'ideas', i.id), i).catch(() => {});
      }
    }

    if (Array.isArray(backup.projects)) {
      const sanitized = backup.projects.map((p: any) => ({ ...p, userId: currentUid, date: p.date || timestamp }));
      setProjects(sanitized);
      setLocal('projects', sanitized);
      if (user && online) {
        for (const p of sanitized) await setDoc(doc(db, 'projects', p.id), p).catch(() => {});
      }
    }

    if (Array.isArray(backup.tasks)) {
      const sanitized = backup.tasks.map((t: any) => ({ ...t, userId: currentUid, date: t.date || timestamp }));
      setTasks(sanitized);
      setLocal('tasks', sanitized);
      if (user && online) {
        for (const t of sanitized) await setDoc(doc(db, 'tasks', t.id), t).catch(() => {});
      }
    }

    if (Array.isArray(backup.reminders)) {
      const sanitized = backup.reminders.map((r: any) => ({ ...r, userId: currentUid, dateCreated: r.dateCreated || timestamp }));
      setReminders(sanitized);
      setLocal('reminders', sanitized);
      if (user && online) {
        for (const r of sanitized) await setDoc(doc(db, 'reminders', r.id), r).catch(() => {});
      }
    }

    if (Array.isArray(backup.vault)) {
      const sanitized = backup.vault.map((v: any) => ({ ...v, userId: currentUid, date: v.date || timestamp }));
      setVaultItems(sanitized);
      setLocal('vault', sanitized);
      if (user && online) {
        for (const v of sanitized) await setDoc(doc(db, 'vault', v.id), v).catch(() => {});
      }
    }

    if (Array.isArray(backup.customtags)) {
      const sanitized = backup.customtags.map((t: any) => ({ ...t, userId: currentUid, date: t.date || timestamp }));
      setCustomTags(sanitized);
      setLocal('customtags', sanitized);
      if (user && online) {
        for (const t of sanitized) await setDoc(doc(db, 'customtags', t.id), t).catch(() => {});
      }
    }

    await logActivity('Importou um pacote de backup');
  };

  return (
    <TechMemoryContext.Provider value={{
      user,
      loadingAuth,
      online,
      syncing,
      notes,
      bookmarks,
      ideas,
      projects,
      tasks,
      reminders,
      vaultItems,
      activities,
      customTags,
      securityPin,
      lockedItemIds,
      lockedModules,
      saveSecuritySettings,
      unlockedItems,
      unlockedModules,
      unlockItem,
      unlockModule,
      lockItem,
      lockModule,
      saveNote,
      deleteNote,
      toggleNoteFavorite,
      saveBookmark,
      deleteBookmark,
      saveIdea,
      deleteIdea,
      saveProject,
      deleteProject,
      saveTask,
      deleteTask,
      toggleTaskCompleted,
      saveReminder,
      deleteReminder,
      saveVaultItem,
      deleteVaultItem,
      saveCustomTag,
      deleteCustomTag,
      logActivity,
      clearAllLocalData,
      importBackupData,
      manualSyncCloud
    }}>
      {children}
    </TechMemoryContext.Provider>
  );
};
