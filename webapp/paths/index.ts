import type { ParsedUrlQuery } from 'querystring';

const paths = {
  org: ({ org }: ParsedUrlQuery) => ({
    index: `/orgs/${org}`,
    create: '/create-org',
  }),
  entities: ({ org, entity, id }: ParsedUrlQuery) => ({
    index: `/orgs/${org}/entities/${entity}`,
    view: `/orgs/${org}/entities/${entity}/${id}`,
  }),
  signupSuccess: '/?signup=success',
  signup: '/signup',
  index: '/',
};
export default paths;
