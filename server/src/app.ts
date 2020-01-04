import { OptionDefinition } from 'command-line-args';
import { Section } from 'command-line-usage';
import { Server, ServerOptions } from './server';

const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');

const optionDefinitions: OptionDefinition[] = [
  { name: 'port', alias: 'p', type: Number, defaultValue: 1774 },
  { name: 'help', alias: 'h', type: Boolean }
];

const usageSections: Section[] = [
  { header: 'potemkin', content: 'A simple tool to mock JSON responses when testing web apps' },
  {
    header: 'Options', optionList: [
      { ...optionDefinitions[0], typeLabel: '{underline number}', description: 'The tcp port that the server should listen on.' },
      { ...optionDefinitions[1], description: 'Displays this help message.' }
    ]
  }
];

(async () => {
  const args = commandLineArgs(optionDefinitions);

  if (args.help || (!args.port || args.port <= 0 || args.port > 65535)) {
    console.log(commandLineUsage(usageSections));
    return;
  }

  const options = new ServerOptions();
  options.debug = false;
  options.port = args.port;

  new Server(options).listen();
})();
