import bcrypt from 'bcrypt';
import JWT from 'jsonwebtoken';
import firestore from '../firebaseConfig';

const Validations = {

  hashPassword(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
  },

  comparePassword(hashPassword, password) {
    return bcrypt.compareSync(password, hashPassword);
  },

  passwordLength(passwordLength) {
    return passwordLength >= 7;
  },

  isValidEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
  },

  generateToken(id) {
    const token = JWT.sign({
      userId: id,
    },
    process.env.JWT_SECRET, { expiresIn: '6h' });
    return token;
  },

  async verifyToken(token) {
    const decoded = await firestore.admin.auth().verifyIdToken(token);
    return decoded;
  },

  checkForChar(field) {
    const char = /^[a-zA-Z]+$/;
    const data = field.trim();
    if (char.test(data)) {
      return true;
    }
    return false;
  },
  userDataValidation(roleId, gender, jobRole, department, address) {
    if (!/^[0-9]+$/.test(roleId)) {
      return false;
    }
    if (!/^[a-zA-Z]+$/.test(gender)) {
      return false;
    }
    if (!/^[0-9a-z\sA-Z]+$/.test(jobRole)) {
      return false;
    }
    if (!/^[0-9a-z\sA-Z]+$/.test(department)) {
      return false;
    }
    if (address.length > 300) {
      return false;
    }
    if (!/^[0-9a-z\sA-Z]+$/.test(address)) {
      return false;
    }
    return true;
  },

};

module.exports = Validations;
