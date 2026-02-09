import { useMutation, useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { Doc, Id } from "../../../../convex/_generated/dataModel"

export const useFile = (fileId: Id<"files"> | null) => {
  return useQuery(api.files.getFile, fileId ? { id: fileId } : "skip")
}

export const useFilePath = (fileId: Id<"files"> | null) => {
  return useQuery(api.files.getFilePath, fileId ? { id: fileId } : "skip")
}

export const useCreateFile = () => {
  return useMutation(api.files.createFile).withOptimisticUpdate(
    (localStore, args) => {
      const { projectId, parentId, name, content } = args

      const existing = localStore.getQuery(api.files.getFolderContents, {
        projectId,
        parentId,
      })

      if (existing === undefined) return

      const optimisticFile: Doc<"files"> = {
        // @ts-expect-error: temporary optimistic id
        _id: `optimistic-${Math.random().toString(36).slice(2)}`,
        projectId,
        name,
        type: "file",
        content,
        updatedAt: Date.now(),
        parentId,
        // storageId is optional and can be left undefined for optimistic entries
      }

      localStore.setQuery(
        api.files.getFolderContents,
        { projectId, parentId },
        [...existing, optimisticFile]
      )
    }
  )
}

export const useUpdateFile = () => {
  return useMutation(api.files.updateFile).withOptimisticUpdate(
    (localStore, args) => {
      const { id, content } = args

      const file = localStore.getQuery(api.files.getFile, { id })
      if (!file) return

      const updated: Doc<"files"> = {
        ...file,
        content,
        updatedAt: Date.now(),
      }

      localStore.setQuery(api.files.getFile, { id }, updated)
    }
  )
}

export const useCreateFolder = () => {
  return useMutation(api.files.createFolder).withOptimisticUpdate(
    (localStore, args) => {
      const { projectId, parentId, name } = args

      const existing = localStore.getQuery(api.files.getFolderContents, {
        projectId,
        parentId,
      })

      if (existing === undefined) return

      const optimisticFolder: Doc<"files"> = {
        // @ts-expect-error: temporary optimistic id
        _id: `optimistic-${Math.random().toString(36).slice(2)}`,
        projectId,
        name,
        type: "folder",
        updatedAt: Date.now(),
        parentId,
      }

      localStore.setQuery(
        api.files.getFolderContents,
        { projectId, parentId },
        [...existing, optimisticFolder]
      )
    }
  )
}

export const useFolderContents = ({
  projectId,
  parentId,
  enabled = true,
}: {
  projectId: Id<"projects">
  parentId?: Id<"files">
  enabled?: boolean
}) => {
  return useQuery(
    api.files.getFolderContents,
    enabled ? { projectId, parentId } : "skip"
  )
}

export const useRenameFile = () => {
  return useMutation(api.files.renameFile).withOptimisticUpdate(
    (localStore, args) => {
      const { id, newName } = args

      const file = localStore.getQuery(api.files.getFile, { id })
      if (!file) return

      const updatedFile: Doc<"files"> = {
        ...file,
        name: newName,
        updatedAt: Date.now(),
      }

      // update single file query
      localStore.setQuery(api.files.getFile, { id }, updatedFile)

      // update folder listing
      const folderContents = localStore.getQuery(api.files.getFolderContents, {
        projectId: file.projectId,
        parentId: file.parentId,
      })

      if (folderContents !== undefined) {
        localStore.setQuery(
          api.files.getFolderContents,
          { projectId: file.projectId, parentId: file.parentId },
          folderContents.map((item: Doc<"files">) =>
            item._id === id ? { ...item, name: newName } : item
          )
        )
      }

      // update breadcrumb path if loaded
      const path = localStore.getQuery(api.files.getFilePath, { id })
      if (path !== undefined) {
        localStore.setQuery(
          api.files.getFilePath,
          { id },
          path.map((segment: { _id: string; name: string }) =>
            segment._id === id ? { ...segment, name: newName } : segment
          )
        )
      }
    }
  )
}

export const useDeleteFile = () => {
  return useMutation(api.files.deleteFile).withOptimisticUpdate(
    (localStore, args) => {
      const { id } = args

      const file = localStore.getQuery(api.files.getFile, { id })
      if (!file) return

      // remove from folder listing
      const folderContents = localStore.getQuery(api.files.getFolderContents, {
        projectId: file.projectId,
        parentId: file.parentId,
      })

      if (folderContents !== undefined) {
        localStore.setQuery(
          api.files.getFolderContents,
          { projectId: file.projectId, parentId: file.parentId },
          folderContents.filter((item: Doc<"files">) => item._id !== id)
        )
      }

      // clear individual file & path queries
      localStore.setQuery(api.files.getFile, { id }, undefined)
      localStore.setQuery(api.files.getFilePath, { id }, undefined)
    }
  )
}