import {
  useParams,
  Link
} from 'react-router-dom'

import { useAppSelector } from '@/app/hooks'
import { selectPostById } from './postsSlice'


export const SinglePostPage = () => {
  const { postId } = useParams()

  const post = useAppSelector(
    (state) => selectPostById(state, postId!)
  )


  if (!post) {
    return (
      <section>
        <h2>
          Post not found!
        </h2>
      </section>
    )
  }

  return (
    <section>
      <article className="post">
        <h2>
          { post.title }
        </h2>

        <p className="post-content">
          { post.content }
        </p>

        <Link
          className="button"
          to={ `/editPost/${ post.id }` }
        >
          Edit Post
        </Link>
      </article>
    </section>
  )
}