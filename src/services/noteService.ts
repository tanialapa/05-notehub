import axios from 'axios'
import type { Note, NoteTag } from '../types/note'

const token = import.meta.env.VITE_NOTEHUB_TOKEN

const notehubApi = axios.create({
  baseURL: 'https://notehub-public.goit.study/api',
  headers: {
    Authorization: `Bearer ${token}`,
  },
})

export interface FetchNotesParams {
  page: number
  perPage: number
  search?: string
}

export interface FetchNotesResponse {
  notes: Note[]
  totalPages: number
}

export interface CreateNoteData {
  title: string
  content: string
  tag: NoteTag
}

export async function fetchNotes({
  page,
  perPage,
  search,
}: FetchNotesParams): Promise<FetchNotesResponse> {
  const response = await notehubApi.get<FetchNotesResponse>('/notes', {
    params: {
      page,
      perPage,
      ...(search ? { search } : {}),
    },
  })

  return response.data
}

export async function createNote(noteData: CreateNoteData): Promise<Note> {
  const response = await notehubApi.post<Note>('/notes', noteData)

  return response.data
}

export async function deleteNote(noteId: string): Promise<Note> {
  const response = await notehubApi.delete<Note>(`/notes/${noteId}`)

  return response.data
}
