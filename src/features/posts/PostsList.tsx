import { Link } from 'react-router-dom'

import { useAppSelector } from '@/app/hooks'
import { selectAllPosts } from './postsSlice'

import { PostAuthor } from './PostAuthor'
import { TimeAgo } from './TimeAgo'


export const PostsList = () => {
  const posts = useAppSelector(selectAllPosts)

  const orderedPosts = posts.slice().sort(
    (a, b) => b.date.localeCompare(a.date)
  )

  const renderedPosts = orderedPosts.map((post) => (
    <article
      className="post-excerpt"
      key={ post.id }
    >
      <h3>
        <Link to={ `/posts/${ post.id }` }>
          { post.title }
        </Link>
      </h3>

      <PostAuthor userId={ post.user } />
      <TimeAgo timestamp={ post.date } />

      <p className="post-content">
        { post.content.substring(0, 100) }
      </p>
    </article>
  ))

  return (
    <section className="posts-list">
      <h2>Posts</h2>

      { renderedPosts }
    </section>
  )
}
