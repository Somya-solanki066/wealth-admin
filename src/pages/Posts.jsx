import { useState, useEffect } from 'react';
import { postService } from '../services/postService';
import { getImageUrl, getProfilePictureUrl } from '../utils/imageHelper';
import './Posts.css';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchPosts();
  }, [page]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postService.getFeed(page, 20);
      
      // Handle both array and object responses
      if (Array.isArray(response)) {
        setPosts(response);
      } else if (response.success) {
        setPosts(response.posts || response.data || []);
      } else if (response.posts) {
        setPosts(response.posts);
      } else if (response.data) {
        setPosts(Array.isArray(response.data) ? response.data : []);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }
    try {
      await postService.deletePost(postId);
      fetchPosts();
    } catch (error) {
      alert('Error deleting post: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="posts-page">
      <div className="page-header">
        <h2>Posts Management</h2>
      </div>

      {loading ? (
        <div className="loading">Loading posts...</div>
      ) : (
        <div className="posts-list">
          {posts.length === 0 ? (
            <div className="empty-state">No posts found</div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <div className="post-author">
                    <img 
                      src={getProfilePictureUrl(post.author, 40)} 
                      alt={post.author?.name || 'User'}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        marginRight: '10px'
                      }}
                      onError={(e) => {
                        e.target.src = getProfilePictureUrl({ name: post.author?.name || 'User' }, 40);
                      }}
                    />
                    <div>
                      <strong>{post.author?.name || 'Unknown'}</strong>
                      {post.page && <span className="page-badge">@{post.page.pageName}</span>}
                    </div>
                  </div>
                  <button className="btn-delete" onClick={() => handleDelete(post.id)}>
                    Delete
                  </button>
                </div>
                <div className="post-content">
                  <p>{post.content || post.caption || 'No content'}</p>
                  {post.images && post.images.length > 0 && (
                    <div className="post-images">
                      {post.images.slice(0, 3).map((img, idx) => {
                        const imageUrl = getImageUrl(img);
                        return imageUrl ? (
                          <img key={idx} src={imageUrl} alt={`Post ${idx + 1}`} />
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
                <div className="post-footer">
                  <span>Likes: {post.likesCount || 0}</span>
                  <span>Comments: {post.commentsCount || 0}</span>
                  <span>Created: {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Posts;

