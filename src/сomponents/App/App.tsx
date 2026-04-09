import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useDebouncedCallback } from 'use-debounce'
import css from './App.module.css'
import NoteList from '../NoteList/NoteList'
import SearchBox from '../SearchBox/SearchBox'
import Pagination from '../Pagination/Pagination'
import Modal from '../Modal/Modal'
import NoteForm from '../NoteForm/NoteForm'
import { createNote, deleteNote, fetchNotes } from '../../services/noteService'

const PER_PAGE = 12

export default function App() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const queryClient = useQueryClient()

  const updateSearch = useDebouncedCallback((value: string) => {
    setSearch(value)
    setPage(1)
  }, 300)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['notes', page, search],
    queryFn: () => fetchNotes({ page, perPage: PER_PAGE, search }),
    placeholderData: previousData => previousData,
  })

  const createNoteMutation = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      setIsModalOpen(false)
    },
  })

  const deleteNoteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
  })

  const notes = data?.notes ?? []
  const totalPages = data?.totalPages ?? 0

  const handleSearch = (value: string) => {
    setInputValue(value)
    updateSearch(value)
  }

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox value={inputValue} onChange={handleSearch} />
        {totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
        <button className={css.button} onClick={() => setIsModalOpen(true)}>
          Create note +
        </button>
      </header>

      {isLoading && <p>Loading notes...</p>}
      {isError && <p>Something went wrong. Please try again.</p>}
      {!isLoading && !isError && notes.length > 0 && (
        <NoteList
          notes={notes}
          onDelete={deleteNoteMutation.mutate}
          deletingNoteId={
            deleteNoteMutation.isPending ? deleteNoteMutation.variables : undefined
          }
        />
      )}
      {!isLoading && !isError && notes.length === 0 && <p>No notes found.</p>}

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <NoteForm
            onCancel={() => setIsModalOpen(false)}
            onSubmit={createNoteMutation.mutateAsync}
            isSubmitting={createNoteMutation.isPending}
          />
        </Modal>
      )}
    </div>
  )
}
