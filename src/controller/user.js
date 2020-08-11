/* eslint-disable no-console */
const firestore = require('../firebaseConfig');
const Validations = require('../validations/auth');

// User Creation functionality...................
exports.signup = async (req, res) => {
  const {
    email, password, name, role,
  } = req.body;

  if (!password || !email) {
    return res.status(400).send({
      status: 'error',
      error: 'email or password missing',
    });
  }

  try {
    const userRecord = await firestore.admin.auth().createUser({
      email,
      password,
    });

    if (!userRecord) {
      return res.status(500).send({
        error: 'An internal error occurred',
      });
    }

    const data = {
      id: userRecord.uid,
      email,
      role,
      name,
      isactive: true,
      createdOn: new Date(),
    };

    const userDoc = await firestore.db.collection('users').doc(userRecord.uid);
    const result = await userDoc.set(data);

    if (!result) {
      return res.status(500).send({
        status: 'error',
        error: 'failed to save details to database',
      });
    }

    return res.status(201).send({
      status: 'successful',
      data: {
        userId: userRecord.uid,
      },
    });
  } catch (error) {
    if (error.code) {
      if (error.code === 'auth/email-already-exists') {
        return res.status(409).send({
          status: 'error',
          error: error.message,
        });
      }
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

// Login USer functionality................................
exports.login = async (req, res) => {
  // eslint-disable-next-line no-unused-vars
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({
      status: 'error',
      error: 'fields cannot be empty',
    });
  }

  try {
    const userRecord = await firestore.admin.auth().getUserByEmail(email);
    if (!userRecord) {
      return res.status(404).send({
        status: 'error',
        error: 'Incorrect credentials',
      });
    }
    const userRef = firestore.db.collection('users').doc(userRecord.uid);
    const userDoc = await userRef.get();

    if (!userDoc) {
      return res.status(404).send({
        status: 'error',
        error: 'User not found',
      });
    }

    const userDbDetails = userDoc.data();
    const decodedPass = Validations.comparePassword(userDbDetails.password, password);
    if (!decodedPass) {
      return res.status(400).send({
        status: 'error',
        error: 'Incorrect credentials',
      });
    }
    const token = Validations.generateToken(userRecord.uid);
    return res.status(200).send({
      status: 'successful',
      userId: userRecord.uid,
      name: userDbDetails.name,
      role: userDbDetails.role,
      token,
    });
  } catch (error) {
    return res.status(500).send({
      status: 'error',
      error,
    });
  }
};

exports.isactive = async (req, res) => {
  // eslint-disable-next-line no-unused-vars
  const { email } = req.body;

  if (!email) {
    return res.status(400).send({
      status: 'error',
      error: 'fields cannot be empty',
    });
  }

  try {
    const userRecord = await firestore.admin.auth().getUserByEmail(email);
    if (!userRecord) {
      return res.status(404).send({
        status: 'error',
        error: 'Incorrect credentials',
      });
    }
    const userRef = firestore.db.collection('users').doc(userRecord.uid);
    const userDoc = await userRef.get();

    if (!userDoc) {
      return res.status(404).send({
        status: 'error',
        error: 'User not found',
      });
    }

    const userDbDetails = userDoc.data();
    return res.status(200).send({
      status: 'successful',
      isactive: userDbDetails.isactive,
    });
  } catch (error) {
    return res.status(500).send({
      status: 'error',
      error,
    });
  }
};

exports.get_user_by_id = async (userId) => {
  const userRef = await firestore.db.collection('users').doc(userId);
  const userDoc = await userRef.get();
  return userDoc.data();
};

exports.suspendUser = async (req, res) => {
  try {
    const { id } = req.body;
    const userId = id;
    if (!userId) {
      return res.status(400).send({
        status: 'error',
        error: 'No id provided',
      });
    }
    await firestore.admin.auth().updateUser(userId, {
      disabled: true,
    });
    const userRef = await firestore.db.collection('users').doc(userId);
    await userRef.update({
      isactive: false,
    });

    return res.status(200).send({
      status: 'success',
      data: {
        message: 'user suspended!!',
      },
    });
  } catch (error) {
    return res.status(500).send({
      status: 'error',
      error: error.code ? error.message : error,
    });
  }
};

exports.reactivateUser = async (req, res) => {
  try {
    const { id } = req.body;
    const userId = id;
    if (!userId) {
      return res.status(400).send({
        status: 'error',
        error: 'No id provided',
      });
    }
    await firestore.admin.auth().updateUser(userId, {
      disabled: false,
    });
    const userRef = await firestore.db.collection('users').doc(userId);
    await userRef.update({
      isactive: true,
    });

    return res.status(200).send({
      status: 'success',
      data: {
        message: 'user suspended!!',
      },
    });
  } catch (error) {
    return res.status(500).send({
      status: 'error',
      error: error.code ? error.message : error,
    });
  }
};

exports.update_user = async (req, res) => {
  try {
    if (!req.params.userid) {
      return res.status(400).send({
        status: 'error',
        error: 'No id provided',
      });
    }

    const { firstname, lastname, role } = req.body;
    if (!firstname || !role || !lastname) {
      return res.status(400).send({
        status: 'error',
        error: 'one or more field is empty',
      });
    }

    const docRef = firestore.db.collection('users').doc(req.params.userid);
    const doc = await docRef.get();
    if (!doc || !doc.exists) {
      return res.status(404).send({
        status: 'error',
        error: 'article not found',
      });
    }

    await docRef.update({
      name: `${firstname} ${lastname}`,
      role,
    });

    return res.status(200).send({
      status: 'successful',
      data: {
        message: 'updated successfully',
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
