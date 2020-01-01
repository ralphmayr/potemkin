import { Server, ServerOptions } from './server';

(async () => {
  const options = new ServerOptions();
  options.debug = true;
  new Server(options).listen();
})();
