import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  orderBy,
  Timestamp
} from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { categorizeTodo, getPriority } from '../config/gemini';
import type { Todo } from '../config/gemini';

const TODOS_COLLECTION = 'todos';

// Add a new todo (can override category/priority and include scheduling)
export const addTodo = async (
  text: string,
  scheduledDate?: Date,
  scheduledTime?: string,
  overrides?: Partial<{ category: string; priority: 'low' | 'medium' | 'high' }>
): Promise<string> => {
  try {
    // Use AI when overrides are not provided
    const [category, priority] = await Promise.all([
      overrides?.category ? Promise.resolve(overrides.category) : categorizeTodo(text),
      overrides?.priority ? Promise.resolve(overrides.priority) : getPriority(text)
    ]);

    const todoData = {
      text,
      completed: false,
      category,
      priority,
      userId: auth.currentUser?.uid || null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      ...(scheduledDate && { scheduledDate: Timestamp.fromDate(scheduledDate) }),
      ...(scheduledTime && { scheduledTime })
    };

    const docRef = await addDoc(collection(db, TODOS_COLLECTION), todoData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding todo:', error);
    throw error;
  }
};

// Get all todos
export const getTodos = async (): Promise<Todo[]> => {
  try {
    const q = query(collection(db, TODOS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const currentUserId = auth.currentUser?.uid;
    
    return querySnapshot.docs
      .map((doc: DocumentData) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
        ...(doc.data().scheduledDate && { scheduledDate: doc.data().scheduledDate.toDate() })
      }))
      .filter((t: Todo) => !currentUserId || t.userId === currentUserId) as Todo[];
  } catch (error) {
    console.error('Error fetching todos:', error);
    throw error;
  }
};

// Update a todo
export const updateTodo = async (id: string, updates: Partial<Todo & { scheduledDate?: Date; scheduledTime?: string }>): Promise<void> => {
  try {
    const todoRef = doc(db, TODOS_COLLECTION, id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {
      ...updates,
      updatedAt: Timestamp.now(),
    };
    
    // Convert Date to Timestamp if scheduledDate is being updated
    if (updates.scheduledDate) {
      updateData.scheduledDate = Timestamp.fromDate(updates.scheduledDate);
    }
    
    await updateDoc(todoRef, updateData);
  } catch (error) {
    console.error('Error updating todo:', error);
    throw error;
  }
};

// Delete a todo
export const deleteTodo = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, TODOS_COLLECTION, id));
  } catch (error) {
    console.error('Error deleting todo:', error);
    throw error;
  }
};

// Toggle completed
export const toggleTodo = async (id: string, completed: boolean): Promise<void> => {
  await updateTodo(id, { completed });
};