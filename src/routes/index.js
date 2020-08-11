import admin from '../controller/user';
import articles from '../controller/articles';
import superUser from '../middlewares/superuser';
import adminUser from '../middlewares/admin';

export default (app) => {
  app.get('/api', (req, res) => res.status(200).send({
    message: 'my blog cms is live',
  }));

  app.post('/api/v1/admin/signup', superUser, admin.signup);
  app.post('/api/v1/admin/login', admin.login);
  app.post('/api/v1/admin/suspend-user', superUser, admin.suspendUser);
  app.post('/api/v1/admin/reactivate-user', superUser, admin.reactivateUser);
  app.post('/api/v1/articles', adminUser, articles.createPost);
  app.get('/api/v1/articles', articles.getAll);
  app.get('/api/v1/articles/author', adminUser, articles.get_article_by_author);
  app.get('/api/v1/articles/:articleid', articles.get_article_by_id);
  app.patch('/api/v1/articles/:articleid', adminUser, articles.update_one);
  app.patch('/api/v1/admin/:userid/edit-user', superUser, admin.update_user);
  app.delete('/api/v1/articles/:articleid', adminUser, articles.delete_one);
};
