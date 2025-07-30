#!/usr/bin/env node

import { defineCommand, main } from './cli.js';

const command = defineCommand();
command.action(main);
command.parseAsync(process.argv);
