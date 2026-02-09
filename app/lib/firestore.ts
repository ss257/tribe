import {
    collection,
    doc,
    setDoc,
    addDoc,
    serverTimestamp,
    getDoc,
    query,
    where,
    getDocs,
    updateDoc,
    deleteDoc
} from "firebase/firestore";
import { db } from "./firebase";
import { User } from "firebase/auth";

// ... [Existing Types] ...
export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    familyId: string | null;
    role: 'Parent' | 'Child' | 'Grandparent' | null;
    createdAt: any;
}

export interface Family {
    id: string;
    name: string;
    createdBy: string;
    createdAt: any;
}

export interface Invite {
    familyId: string;
    email: string;
    role: 'Parent' | 'Child' | 'Grandparent';
    invitedBy: string;
    status: 'pending' | 'accepted';
    createdAt: any;
}

export interface Chore {
    id: string;
    familyId: string;
    title: string;
    description?: string;
    assignedTo: string;
    points: number;
    status: 'pending' | 'completed';
    createdBy: string;
    createdAt: any;
    completedAt?: any;
}

export interface AppEvent {
    id: string;
    familyId: string;
    title: string;
    description?: string;
    date: any;
    assignedTo?: string;
    createdBy: string;
    createdAt: any;
}

export interface GroceryList {
    id: string;
    familyId: string;
    title: string;
    createdBy: string;
    assignedTo?: string;
    createdAt: any;
}

export interface GroceryItem {
    id: string;
    listId: string;
    name: string;
    quantity?: string;
    checked: boolean;
    calories?: number;
    protein?: number;
}

// ... [Existing User/Family/Invite Helpers] ...
// I will rewrite the whole file to be safe and complete

// User Helpers
export const createUserProfile = async (user: User, additionalData: Partial<UserProfile> = {}) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        const { email, uid } = user;
        const createdAt = serverTimestamp();

        try {
            await setDoc(userRef, {
                uid,
                email,
                createdAt,
                ...additionalData
            });
        } catch (error) {
            console.error("Error creating user", error);
        }
    }
    return userRef;
};

export const getUserProfile = async (uid: string) => {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        return userSnap.data() as UserProfile;
    }
    return null;
};

export const getFamilyMembers = async (familyId: string) => {
    const q = query(collection(db, "users"), where("familyId", "==", familyId));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as UserProfile);
};

// Family Helpers
export const createFamily = async (userId: string, familyName: string) => {
    try {
        const familyRef = await addDoc(collection(db, "families"), {
            name: familyName,
            createdBy: userId,
            createdAt: serverTimestamp()
        });

        // Update user with familyId
        await setDoc(doc(db, "users", userId), { familyId: familyRef.id }, { merge: true });

        return familyRef.id;
    } catch (error) {
        console.error("Error creating family", error);
        throw error;
    }
};

export const getFamilyData = async (familyId: string) => {
    const familyRef = doc(db, "families", familyId);
    const familySnap = await getDoc(familyRef);
    if (familySnap.exists()) {
        return { id: familySnap.id, ...familySnap.data() } as Family;
    }
    return null;
}


// Invite Helpers
export const createInvite = async (
    familyId: string,
    email: string,
    role: 'Parent' | 'Child' | 'Grandparent',
    invitedBy: string
) => {
    try {
        await addDoc(collection(db, "invites"), {
            familyId,
            email,
            role,
            invitedBy,
            status: 'pending',
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error creating invite", error);
        throw error;
    }
};

export const checkInvite = async (email: string) => {
    const q = query(collection(db, "invites"), where("email", "==", email), where("status", "==", "pending"));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Invite & { id: string };
    }
    return null;
};

export const acceptInvite = async (inviteId: string, userId: string) => {
    const inviteRef = doc(db, "invites", inviteId);
    const inviteSnap = await getDoc(inviteRef);

    if (inviteSnap.exists()) {
        const invite = inviteSnap.data() as Invite;

        // Update invite status
        await setDoc(inviteRef, { status: 'accepted' }, { merge: true });

        // Update user profile
        await setDoc(doc(db, "users", userId), {
            familyId: invite.familyId,
            role: invite.role
        }, { merge: true });

        return invite.familyId;
    }
    return null;
};

// --- New Core Feature Helpers ---

// Chores
export const addChore = async (chore: Omit<Chore, "id" | "createdAt" | "status">) => {
    return await addDoc(collection(db, "families", chore.familyId, "chores"), {
        ...chore,
        status: 'pending',
        createdAt: serverTimestamp()
    });
};

export const completeChore = async (familyId: string, choreId: string) => {
    await updateDoc(doc(db, "families", familyId, "chores", choreId), {
        status: 'completed',
        completedAt: serverTimestamp()
    });
    // In a real app, you'd trigger a transaction to award points to the user here
};

export const updateChoreStatus = async (familyId: string, choreId: string, status: 'pending' | 'completed') => {
    await updateDoc(doc(db, "families", familyId, "chores", choreId), {
        status,
        completedAt: status === 'completed' ? serverTimestamp() : null
    });
};

export const getFamilyChores = async (familyId: string) => {
    const q = query(collection(db, "families", familyId, "chores"));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() })) as Chore[];
};

// Events
export const addEvent = async (event: Omit<AppEvent, "id" | "createdAt">) => {
    return await addDoc(collection(db, "families", event.familyId, "events"), {
        ...event,
        createdAt: serverTimestamp()
    });
};

export const getFamilyEvents = async (familyId: string) => {
    const q = query(collection(db, "families", familyId, "events"));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() })) as AppEvent[];
};

// Groceries
export const createGroceryList = async (familyId: string, title: string, createdBy: string, assignedTo?: string) => {
    return await addDoc(collection(db, "families", familyId, "groceryLists"), {
        title,
        createdBy,
        assignedTo,
        createdAt: serverTimestamp()
    });
};

export const addGroceryItem = async (familyId: string, listId: string, item: Omit<GroceryItem, "id" | "listId">) => {
    return await addDoc(collection(db, "families", familyId, "groceryLists", listId, "items"), item);
};

export const toggleGroceryItem = async (familyId: string, listId: string, itemId: string, currentStatus: boolean) => {
    await updateDoc(doc(db, "families", familyId, "groceryLists", listId, "items", itemId), {
        checked: !currentStatus
    });
};

export const getFamilyGroceryLists = async (familyId: string) => {
    const q = query(collection(db, "families", familyId, "groceryLists"));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() })) as GroceryList[];
};

export const getGroceryItems = async (familyId: string, listId: string) => {
    const q = query(collection(db, "families", familyId, "groceryLists", listId, "items"));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() })) as GroceryItem[];
};


// Memoirs
export interface AppMemoir {
    id: string;
    familyId: string; // Kept for interface consistency, but stored in subcollection
    title: string;
    description?: string;
    coverImageUrl?: string;
    createdBy: string;
    assignedTo?: string;
    createdAt: any;
}

export interface MemoirQuestion {
    id: string;
    questionType: 'image' | 'prompt';
    imageUrl?: string;
    promptText?: string;
    questionText: string;
    assignedTo: string;
    status: 'pending' | 'answered';
    createdAt: any;
    answer?: MemoirAnswer; // Computed/Attached on fetch if needed, or separate
}

export interface MemoirAnswer {
    id: string;
    answeredBy: string;
    answerText: string;
    answeredAt: any;
}

export const createMemoir = async (familyId: string, memoir: Omit<AppMemoir, "id" | "createdAt" | "familyId">) => {
    return await addDoc(collection(db, "families", familyId, "memoirs"), {
        ...memoir,
        createdAt: serverTimestamp()
    });
};

export const getFamilyMemoirs = async (familyId: string) => {
    const q = query(collection(db, "families", familyId, "memoirs"));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data(), familyId })) as AppMemoir[];
};

export const addMemoirQuestion = async (familyId: string, memoirId: string, question: Omit<MemoirQuestion, "id" | "createdAt" | "status" | "answer">) => {
    return await addDoc(collection(db, "families", familyId, "memoirs", memoirId, "questions"), {
        ...question,
        status: 'pending',
        createdAt: serverTimestamp()
    });
};

export const getMemoirQuestions = async (familyId: string, memoirId: string) => {
    const q = query(collection(db, "families", familyId, "memoirs", memoirId, "questions"));
    const snap = await getDocs(q);
    // Note: Fetching answers would typically be a separate call or require a robust query strategy
    // For now, we return questions. Answers will be fetched per question or via parent mapping if needed.
    return snap.docs.map(d => ({ id: d.id, ...d.data() })) as MemoirQuestion[];
};

export const getUserPendingQuestions = async (userId: string, familyId: string) => {
    // collectionGroup query to find questions assigned to the user
    // We restrict by familyId to ensure we only get relevant questions (though assignedTo should be enough security-wise)
    // Note: strict security rules might require specific hierarchy checks, but collectionGroup is powerful.

    // Strategy: Fetch all memoirs for family, then fetch pending questions for each? 
    // OR use collectionGroup. simple collectionGroup is easier.
    // Let's stick to iterating memoirs for now to avoid index creation requirements for collectionGroup if possible, 
    // BUT collectionGroup is better. Let's try collectionGroup.

    // actually, let's just iterate through the family's memoirs. It's safer for permissions structure.
    // 1. Get all memoirs
    const memoirs = await getFamilyMemoirs(familyId);

    let allPending: (MemoirQuestion & { memoirId: string, memoirTitle: string })[] = [];

    for (const memoir of memoirs) {
        const q = query(
            collection(db, "families", familyId, "memoirs", memoir.id, "questions"),
            where("assignedTo", "==", userId),
            where("status", "==", "pending")
        );
        const snap = await getDocs(q);
        const questions = snap.docs.map(d => ({
            id: d.id,
            ...d.data(),
            memoirId: memoir.id,
            memoirTitle: memoir.title
        })) as (MemoirQuestion & { memoirId: string, memoirTitle: string })[];

        allPending = [...allPending, ...questions];
    }

    return allPending;
};

export const answerMemoirQuestion = async (familyId: string, memoirId: string, questionId: string, userId: string, answerText: string) => {
    // 1. Add Answer
    await addDoc(collection(db, "families", familyId, "memoirs", memoirId, "questions", questionId, "answers"), {
        answeredBy: userId,
        answerText,
        answeredAt: serverTimestamp()
    });

    // 2. Update Question Status
    await updateDoc(doc(db, "families", familyId, "memoirs", memoirId, "questions", questionId), {
        status: 'answered'
    });
};

// Family Member Helpers
export const addFamilyMember = async (familyId: string, email: string, role: string, invitedBy: string, name: string) => {
    return await addDoc(collection(db, "families", familyId, "members"), {
        name,
        email,
        role,
        invitedBy,
        joined: false,
        createdAt: serverTimestamp()
    });
};

export const joinFamily = async (email: string, familyId: string, role: 'Parent' | 'Child' | 'Grandparent', userId: string) => {
    try {
        // 1. Find the member record in the family to update 'joined' status
        const q = query(collection(db, "families", familyId, "members"), where("email", "==", email));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            const memberDoc = snapshot.docs[0];
            await updateDoc(memberDoc.ref, { joined: true, userId });
        }

        // 2. Update the user's global profile
        await setDoc(doc(db, "users", userId), {
            familyId,
            role,
            email // Ensure email is set
        }, { merge: true });

        return true;
    } catch (error) {
        console.error("Error joining family:", error);
        throw error;
    }
};

