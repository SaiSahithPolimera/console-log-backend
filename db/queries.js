const prisma = require("../db/prismaClient");
const createUser = async (username, password, email) => {
  try {
    await prisma.user.create({
      data: {
        username: username,
        email: email,
        password: password,
      },
    });
    return "Sign-up success";
  } catch (err) {
    if (err.code === "P2002") {
      return `${err.meta.target[0]} already exists`;
    } else {
      return "Error occurred during Sign-Up!";
    }
  }
};

const getPost = async (title) => {
  try {
    const post = await prisma.post.findUnique({
      where: {
        title: title,
      },
      include: {
        tags: true,
        comments: true,
        likes: true,
      },
    });

    if (!post) {
      return { success: false, message: "Post not found" };
    }
    const comments = post.comments.map(async (comment) => {
      if (comment.postId === post.id) {
        const { username } = await prisma.user.findUnique({
          where: {
            id: comment.userId,
          },
        });
        
        {comment.message, username}
      }
    });

    return {
      success: true,
      post: {
        ...post,
        likeCount: post.likes.l,
        comments: comments,
        tags: post.tags.filter((tag) => tag.postId === post.id),
      },
    };
  } catch (err) {
    console.error(err);
    return { success: false, message: "Error fetching post" };
  }
};

const verifyAdmin = async (username) => {
  try {
    const { role } = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });
    if (role === "ADMIN") {
      return true;
    }
  } catch (err) {
    console.error(err);
  }
  return false;
};

const getUserCredentials = async (uname) => {
  try {
    const { username, password } = await prisma.user.findUnique({
      where: {
        username: uname,
      },
    });
    return { username, password };
  } catch (err) {
    console.error(err);
  }
};

const findUser = async (username) => {
  try {
    const result = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });
    if (result) {
      return true;
    }
  } catch (err) {
    console.error(err);
  }
  return false;
};

const addComment = async (username, comment, postTitle) => {
  try {
    const Post = await prisma.post.findUnique({
      where: {
        title: postTitle,
      },
    });
    const User = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });
    const result = await prisma.comment.create({
      data: {
        postId: Post.id,
        message: comment,
        userId: User.id,
      },
    });
    if (result) {
      return true;
    }
  } catch (err) {
    console.error(err);
  }
  return false;
};

const createPost = async (title, content) => {
  try {
    const result = await prisma.post.create({
      data: {
        title: title,
        content: content,
      },
    });
    return result;
  } catch (err) {
    console.error(err);
  }
};

const getAllPosts = async () => {
  try {
    const posts = await prisma.post.findMany();
    return posts;
  } catch (err) {
    console.error(err);
  }
};

const updatePost = async (title, updatedTitle, updatedContent) => {
  try {
    const { id } = await prisma.post.findUnique({
      where: {
        title: title,
      },
    });
    const result = await prisma.post.update({
      where: {
        id: id,
      },
      data: {
        title: updatedTitle,
        content: updatedContent,
      },
    });
    if (result) {
      return true;
    }
  } catch (err) {
    console.error(err);
  }
  return false;
};

const deletePost = async (title) => {
  try {
    const result = await prisma.post.delete({
      where: {
        title: title,
      },
    });
    if (result) {
      return true;
    }
  } catch (err) {
    console.error(err);
  }
  return false;
};

const createTag = async (tagName, title) => {
  try {
    const result = await prisma.tag.create({
      data: {
        name: tagName,
        postId: postID,
      },
    });
    if (result) {
      return true;
    }
  } catch (err) {
    console.log("Error");
    console.log(err);
    if (err.code === "P2002") {
      return { error: `${err.meta.modelName} already exists` };
    }
    console.error(err);
  }
  return false;
};

const getAllTags = async () => {
  try {
    const tags = await prisma.tag.findMany();
    return tags;
  } catch (err) {
    console.error(err);
  }
  return false;
};

const likePost = async (title, username) => {
  try {
    const post = await prisma.post.findUnique({
      where: { title },
    });

    if (!post) {
      return { success: false, message: "Post not found" };
    }

    const existingLike = await prisma.like.findFirst({
      where: {
        postId: post.id,
        username: username,
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id },
      });

      return { success: true, liked: false };
    }

    await prisma.like.create({
      data: {
        post: { connect: { id: post.id } },
        username: username,
      },
    });

    return { success: true, liked: true };
  } catch (err) {
    console.error(err);
    return { success: false, message: "Error processing like" };
  }
};

module.exports = {
  createUser,
  findUser,
  getUserCredentials,
  createPost,
  getAllPosts,
  updatePost,
  deletePost,
  verifyAdmin,
  addComment,
  createTag,
  getAllTags,
  likePost,
  getPost,
};
