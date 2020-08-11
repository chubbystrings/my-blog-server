import Validations from '../validations/auth';
import admin from '../controller/user';

export default async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).send({
        status: 'error',
        error: 'authorization not provided',
      });
    }
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      return res.status(401).send({
        status: 'error',
        error: 'authorization not provided',
      });
    }
    const decodedToken = await Validations.verifyToken(token);
    const { uid } = decodedToken;
    const userId = uid;
    if (!userId) {
      return res.status(401).send({
        status: 'error',
        error: 'Invalid Token',
      });
    }
    const USER = await admin.get_user_by_id(userId);
    if (USER.role && USER.role === 'superuser') {
      req.token = token;
      req.user = {
        ID: userId,
        name: USER.name,
        role: USER.role,
      };
      return next();
    }
    return res.status(401).send({
      status: 'error',
      error: 'UnAuthorized User',
    });
  } catch (error) {
    return res.status(500).send({
      status: 'error',
      error,
    });
  }
};
