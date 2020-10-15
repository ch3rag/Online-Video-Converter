import { makeAuthPlugin } from '@/feathers-vuex';

export default makeAuthPlugin({ userService: 'users' });
