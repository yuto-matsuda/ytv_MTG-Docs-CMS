import type { Document, Image, SimpleRes, User } from "./types";

const BASE_URL = import.meta.env.VITE_API_URL;
const TOKEN_KEY = 'ytv_mtg_docs_token';

//=== Token management functions ===//
export function setToken(token: string) {
    try {
        localStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
        console.warn('localStorage not available, using sessionStorage:', error);
        sessionStorage.setItem(TOKEN_KEY, token);
    }
}

export function getToken() {
    try {
        return localStorage.getItem(TOKEN_KEY);
    } catch (error) {
        console.warn('localStorage not available, trying sessionStorage:', error);
        try {
            return sessionStorage.getItem(TOKEN_KEY);
        } catch (sessionError) {
            console.error('Both localStorage and sessionStorage not available:', sessionError);
            return null;
        }
    }
}

function clearToken() {
    try {
        localStorage.removeItem(TOKEN_KEY);
    } catch (error) {
        console.warn('localStorage not available, clearing sessionStorage:', error);
    }
    try {
        sessionStorage.removeItem(TOKEN_KEY);
    } catch (error) {
        console.warn('sessionStorage not available:', error);
    }
}

//=== Generic request function ===//
async function request<T>(path: string, init: RequestInit = {}) {
    const token = getToken();
    const headers = new Headers(init?.headers);
    if (!(init.body instanceof FormData)) headers.set("Content-Type", "application/json");
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const finalInit: RequestInit = { ...init, headers };
    if (!path.startsWith('/')) path = `/${path}`;
    const url = `${BASE_URL}${path}`;

    const method = (finalInit.method || 'GET').toUpperCase();
    const res = await fetch(url, finalInit);
    const json = await res.json();
    
    if (!res.ok) {
        const message = `[${res.status}] ${method} ${url} | ${json.error}`
        throw new Error(message);
    }
    
    console.log(`[${res.status}] ${method} ${url}`);
    return json as T;
}

//=== Autholize functions ===//
interface LoginRes {
    token: string
}

export async function login(user_id: string, password: string) {
    try {
        const res = await request<LoginRes>('/login', {
            method: 'POST',
            body: JSON.stringify({ user_id, password }),
        });
        setToken(res.token);
        return true;
    } catch (error) {
        console.error(error);
        return false
    }
}

export function logout() {
    clearToken();
}

export function isAdmin(user: User) {
    return user.role === 'admin';
}

//=== Fetch functions ===//
export async function getAllUsers() {
    return request<User[]>('/users');
}

interface CreateUserRes {
    user_uuid: string
};

export async function createUser(user_id: string, password: string, username: string, role: string) {
    return request<CreateUserRes>('/users', {
        method: 'POST',
        body: JSON.stringify({ user_id, password, username, role }),
    });
}

export async function updateUserById(id: string, user_id: string, password: string, username: string, role: string) {
    return request<SimpleRes>(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ user_id, password, username, role }),
    });
}

export async function deleteUserById(id: string) {
    return request<SimpleRes>(`/users/${id}`, {
        method: 'DELETE',
    });
}

export async function getMe() {
    return request<User>('/users/me');
}

export async function getAllDocuments() {
    return request<Document[]>(`/docs`);
}

export async function createDocument(title: string, mtg_date: string, body: string, created_by: string) {
    return request<Document>('/docs', {
        method: 'POST',
        body: JSON.stringify({ title, mtg_date, body, created_by }),
    });
}

export async function getDocumentById(id: string) {
    return request<Document>(`docs/${id}`);
}

export async function updateDocumentById(id: string, title: string, mtg_date: string, body: string, created_by: string) {
    return request<Document>(`docs/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ title, mtg_date, body, created_by }),
    });
}

export async function deleteDocumentById(id: string) {
    return request<Document>(`docs/${id}`, {
        method: 'DELETE'
    });
}

export async function getMyImages() {
    return request<Image[]>('/images');
}

// TODO: 使いにくいからリファクタ（APIも）
export async function getImageByPath(name: string) {
    return request<Image>(`images/${encodeURIComponent(name)}`);
}

export async function uploadImages(formData: FormData) {
    return request<Image[]>('/images', {
        method: 'POST',
        body: formData,
    });
}

export async function updateImageNameById(id: string, name: string) {
    return request<Image>(`images/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name }),
    });
}

export async function deleteImageById(id: string) {
    return request<SimpleRes>(`images/${id}`, {
        method: 'DELETE'
    });
}

export async function getStorageUsage() {
    return request('/images/storage-usage');
}