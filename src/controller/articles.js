import firestore from '../firebaseConfig';

exports.createPost = async (req, res) => {
  const { title, content, category } = req.body;

  try {
    if (!title || !content || !category) {
      return res.status(400).send({
        status: 'error',
        error: 'no empty field',
      });
    }
    const postDoc = await firestore.db.collection('posts').add({
      createdOn: new Date(),
      author: req.user.name,
      author_id: req.user.ID,
      title,
      content,
      category,
    });
      // eslint-disable-next-line no-underscore-dangle
    const idPath = postDoc._path;
    return res.status(201).send({
      status: 'successful',
      data: {
        id: idPath.segments[1] ? idPath.segments[1] : '',
        message: 'post created!!',
      },
    });
  } catch (error) {
    if (error.code) {
      return res.status(500).send({
        status: 'error',
        error: error.message,
      });
    }

    return res.status(500).send({
      status: 'error',
      error,
    });
  }
};

exports.getAll = async (req, res) => {
  try {
    const result = [];
    const postsRef = firestore.db.collection('posts');
    const snapshot = await postsRef.orderBy('createdOn', 'desc').get();
    snapshot.forEach((doc) => {
      result.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return res.status(200).send({
      status: 'successful',
      data: result,
    });
  } catch (error) {
    if (error.code) {
      return res.status(500).send({
        status: 'error',
        error: error.message,
      });
    }

    return res.status(500).send({
      status: 'error',
      error,
    });
  }
};

exports.get_article_by_author = async (req, res) => {
  try {
    if (!req.user || !req.user.ID) {
      return res.status(401).send({
        status: 'error',
        error: 'user not authenticated',
      });
    }
    const docRef = firestore.db.collection('posts');
    const snapshot = await docRef.orderBy('createdOn', 'desc').get();
    if (!snapshot) {
      return res.status(404).send({
        status: 'error',
        error: 'No posts found',
      });
    }
    const result = [];
    snapshot.forEach((doc) => {
      if (doc.data().author_id === req.user.ID) {
        result.push({
          id: doc.id,
          post: doc.data(),
        });
      }
    });

    return res.status(200).send({
      status: 'successful',
      data: result,
    });
  } catch (error) {
    if (error.code) {
      return res.status(500).send({
        status: 'error',
        error: error.message,
      });
    }
    return res.status(500).send({
      status: 'error',
      error,
    });
  }
};

exports.get_article_by_id = async (req, res) => {
  try {
    if (!req.params.articleid) {
      return res.status(400).send({
        status: 'error',
        error: 'No Id provided',
      });
    }

    const articleId = req.params.articleid;
    const docRef = firestore.db.collection('posts').doc(articleId);
    const doc = await docRef.get();
    if (!doc || !doc.exists) {
      return res.status(404).send({
        status: 'error',
        error: 'Article not found',
      });
    }

    return res.status(200).send({
      status: 'successful',
      data: {
        id: doc.id,
        ...doc.data(),
      },
    });
  } catch (error) {
    if (error.code) {
      return res.status(500).send({
        status: 'error',
        error: error.message,
      });
    }

    return res.status(500).send({
      status: 'error',
      error,
    });
  }
};

exports.delete_one = async (req, res) => {
  try {
    if (!req.params.articleid) {
      return res.status(400).send({
        status: 'error',
        error: 'No id provided',
      });
    }
    const docRef = firestore.db.collection('posts').doc(req.params.articleid);
    const doc = await docRef.get();
    if (!doc || !doc.exists) {
      return res.status(404).send({
        status: 'error',
        error: 'article not found',
      });
    }

    const docUser = doc.data();

    if (req.user.role === 'superuser' || (docUser.author_id === req.user.ID && doc.id === req.params.articleid)) {
      await firestore.db.collection('posts').doc(req.params.articleid).delete();
      return res.status(200).send({
        status: 'successful',
        data: {
          message: 'deleted successfully',
        },
      });
    }

    return res.status(401).send({
      status: 'error',
      error: 'user Not authorized',
    });
  } catch (error) {
    if (error.code) {
      return res.status(500).send({
        status: 'error',
        error: error.message,
      });
    }
    return res.status(500).send({
      status: 'error',
      error,
    });
  }
};

exports.update_one = async (req, res) => {
  try {
    if (!req.params.articleid) {
      return res.status(400).send({
        status: 'error',
        error: 'No id provided',
      });
    }

    const { title, content, category } = req.body;
    if (!title || !content || !category) {
      return res.status(400).send({
        status: 'error',
        error: 'one or more field is empty',
      });
    }

    const docRef = firestore.db.collection('posts').doc(req.params.articleid);
    const doc = await docRef.get();
    if (!doc || !doc.exists) {
      return res.status(404).send({
        status: 'error',
        error: 'article not found',
      });
    }

    const docUser = doc.data();
    if (docUser.author_id === req.user.ID && doc.id === req.params.articleid) {
      await firestore.db.collection('posts').doc(req.params.articleid).update({
        title,
        content,
        category,
      });

      return res.status(200).send({
        status: 'successful',
        data: {
          message: 'updated successfully',
        },
      });
    }

    return res.status(401).send({
      status: 'error',
      error: 'user Not authorized',
    });
  } catch (error) {
    if (error.code) {
      return res.status(500).send({
        status: 'error',
        error: error.message,
      });
    }

    return res.status(500).send({
      status: 'error',
      error,
    });
  }
};
