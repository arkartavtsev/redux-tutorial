import {
  type PayloadAction,
  type EntityState,
  createEntityAdapter,
  createSlice
} from '@reduxjs/toolkit'

import type { RootState } from '@/app/store'

import { client } from '@/api/client'
import { createAppAsyncThunk } from '@/app/withTypes'
import { AppStartListening } from '@/app/listenerMiddleware'

import { apiSlice } from '@/features/api/apiSlice'
import { logout } from '@/features/auth/authSlice'


export interface Reactions {
  thumbsUp: number
  tada: number
  heart: number
  rocket: number
  eyes: number
}

export type ReactionName = keyof Reactions

export interface Post {
  id: string
  title: string
  content: string
  user: string
  date: string
  reactions: Reactions
}

export type NewPost = Pick<Post, 'title' | 'content' | 'user'>
export type PostUpdate = Pick<Post, 'id' | 'title' | 'content'>

export interface PostsState extends EntityState<Post, string> {
  status: 'idle' | 'pending' | 'succeeded' | 'rejected'
  error: string | null
}


const postsAdapter = createEntityAdapter<Post>({
  sortComparer: (a, b) => b.date.localeCompare(a.date)
})

const initialState: PostsState = postsAdapter.getInitialState({
  status: 'idle',
  error: null
})

const postsSlice = createSlice({
  name: 'posts',
  initialState,

  reducers: {
    postUpdated(
      state,
      action: PayloadAction<PostUpdate>
    ) {
      const { id, title, content } = action.payload
      
      postsAdapter.updateOne(state, { id, changes: { title, content } })
    },

    reactionAdded(
      state,
      action: PayloadAction<{ postId: string; reaction: ReactionName }>
    ) {
      const { postId, reaction } = action.payload
      const existingPost = state.entities[postId]

      if (existingPost) {
        existingPost.reactions[reaction]++
      }
    }
  },

  extraReducers: (builder) => {
    builder
      .addCase(logout.fulfilled, () => {
        return initialState
      })
      .addCase(fetchPosts.pending, (state) => {
        state.status = 'pending'
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        postsAdapter.setAll(state, action.payload)
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'rejected'
        state.error = action.error.message ?? 'Unknown Error'
      })
      .addCase(addNewPost.fulfilled, postsAdapter.addOne)
  },

  selectors: {
    selectPostsStatus: (postsState) => postsState.status,
    selectPostsError: (postsState) => postsState.error
  }
})


export const fetchPosts = createAppAsyncThunk(
  'posts/fetchPosts',

  async () => {
    const response = await client.get<Post[]>('/fakeApi/posts')

    return response.data
  },

  {
    condition(arg, thunkApi) {
      const postsStatus = selectPostsStatus(thunkApi.getState())

      return postsStatus === 'idle'
    }
  }
)

export const addNewPost = createAppAsyncThunk(
  'posts/addNewPost',

  async (initialPost: NewPost) => {
    const response = await client.post<Post>('/fakeApi/posts', initialPost)

    return response.data
  }
)

export const {
  postUpdated,
  reactionAdded
} = postsSlice.actions

export const {
  selectPostsStatus,
  selectPostsError
} = postsSlice.selectors

export const {
  selectAll: selectAllPosts,
  selectById: selectPostById,
  selectIds: selectPostIds
} = postsAdapter.getSelectors((state: RootState) => state.posts)

export const addPostsListeners = (startAppListening: AppStartListening) => {
  startAppListening({
    matcher: apiSlice.endpoints.addNewPost.matchFulfilled,

    effect: async (action, listenerApi) => {
      const { toast } = await import('react-tiny-toast')

      const toastId = toast.show('New post added!', {
        variant: 'success',
        position: 'bottom-right',
        pause: true
      })

      await listenerApi.delay(5000)

      toast.remove(toastId)
    }
  })
}

export default postsSlice.reducer
