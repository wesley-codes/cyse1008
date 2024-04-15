import useSWR from 'swr';
import { useMemo, useState, useEffect, useCallback, } from 'react';
import { doc, query, getDoc, getDocs, deleteDoc, collection } from "firebase/firestore";
import { fetcher, endpoints } from 'src/utils/axios';
import { DB } from 'src/auth/context/firebase/lib';
import { useSnackbar } from 'src/components/snackbar';


export function useGetPosts() {
  const [data, setData] = useState({ posts: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const q = query(collection(DB, "posts")); // Assuming you have a collection named 'posts'
        const querySnapshot = await getDocs(q);
        const posts = querySnapshot.docs.map(docSnapshot => ({ id: docSnapshot.id, ...docSnapshot.data() }));
        setData({ posts });
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching posts from Firestore:", err);
        setError(err);
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []); // This effect runs once on component mount

  // Memoize value to avoid unnecessary re-renders
  const memoizedValue = useMemo(() => ({
    posts: data.posts,
    postsLoading: isLoading,
    postsError: error,
    postsValidating: isLoading, // For consistency with the original function's return value
    postsEmpty: !isLoading && !data.posts.length,
  }), [data.posts, error, isLoading]);

  return memoizedValue;
}

export const useDeletePost = () => {
  const { enqueueSnackbar } = useSnackbar();
  

  const deletePost = useCallback(async (postId) => {
    console.log({ postId })
    try {
      await deleteDoc(doc(DB, 'posts', postId));
      enqueueSnackbar('Post successfully deleted', { variant: 'success' });
    } catch (error) {
      console.error('Error deleting post: ', error);
      enqueueSnackbar('Failed to delete post', { variant: 'error' });
    }
  }, [enqueueSnackbar]);

  return deletePost;
};

export function useGetPost(postId) {
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!postId) {
      // If no postId is provided, immediately return without fetching
      setPost(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    const fetchPost = async () => {
      setIsLoading(true);
      try {
        const postRef = doc(DB, "posts", postId); // Assuming 'posts' is your collection
        const docSnap = await getDoc(postRef);

        if (docSnap.exists()) {
          setPost({ id: docSnap.id, ...docSnap.data() });
        } else {
          // Handle the case where the document does not exist
          console.log("No such document!");
          setError("No such document!");
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [postId]); // Depend on postId to re-fetch when it changes

  // Memoize the returned object to avoid unnecessary re-renders
  const memoizedValue = useMemo(() => ({
    post,
    postLoading: isLoading,
    postError: error,
    postValidating: isLoading, // Using isLoading for consistency with the original function's interface
  }), [post, error, isLoading]);

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useSearchPosts(_query) {
  const URL = _query ? [endpoints.post.search, { params: { _query } }] : '';

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher, {
    keepPreviousData: true,
  });

  const memoizedValue = useMemo(
    () => ({
      searchResults: data?.results || [],
      searchLoading: isLoading,
      searchError: error,
      searchValidating: isValidating,
      searchEmpty: !isLoading && !data?.results.length,
    }),
    [data?.results, error, isLoading, isValidating]
  );

  return memoizedValue;
}
