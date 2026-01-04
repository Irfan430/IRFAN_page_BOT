/**
 * Help Command Plugin
 * Shows all available commands
 * Author: IRFAN
 * Version: 2.0.0
 */

const config = require('../../config.json');
const fbApi = require('../../utils/fbApi');

module.exports = {
  config: {
    name: 'help',
    aliases: ['h', 'commands', 'menu'],
    description: 'Show all available commands',
    category: 'general',
    usage: '/help [command]',
    credits: 'IRFAN',
    dependencies: [],
  },

  start: async function(senderId, args, originalMessage) {
    try {
      const commandPlugins = require('../../utils/pluginLoader').getCommandPlugins();
      
      // If specific command requested
      if (args.length > 0) {
        const commandName = args[0].toLowerCase();
        const plugin = commandPlugins.find(
          p => p.config.name === commandName || 
               (p.config.aliases && p.config.aliases.includes(commandName))
        );
        
        if (plugin) {
          const details = `
🔍 *Command Details*:
• *Name*: ${plugin.config.name}
• *Description*: ${plugin.config.description}
• *Category*: ${plugin.config.category}
• *Usage*: \`${plugin.config.usage}\`
• *Aliases*: ${plugin.config.aliases?.join(', ') || 'None'}
• *Credits*: ${plugin.config.credits}
          `.trim();
          
          await fbApi.sendMessage(senderId, details);
          return;
        } else {
          await fbApi.sendMessage(senderId, 
            `Command "${args[0]}" not found. Use /help to see all commands.`
          );
          return;
        }
      }
      
      // Group commands by category
      const commandsByCategory = {};
      for (const plugin of commandPlugins) {
        const category = plugin.config.category || 'general';
        if (!commandsByCategory[category]) {
          commandsByCategory[category] = [];
        }
        commandsByCategory[category].push(plugin.config);
      }
      
      // Build help message
      let helpMessage = `🤖 *${config.bot.name} Help Menu*\n\n`;
      helpMessage += `*Prefix*: \`${config.bot.prefix}\`\n`;
      helpMessage += `*Total Commands*: ${commandPlugins.length}\n\n`;
      
      for (const [category, commands] of Object.entries(commandsByCategory)) {
        helpMessage += `📁 *${category.toUpperCase()}*\n`;
        commands.forEach(cmd => {
          helpMessage += `• \`${config.bot.prefix}${cmd.name}\` - ${cmd.description}\n`;
        });
        helpMessage += '\n';
      }
      
      helpMessage += `📝 *Usage*: Use \`${config.bot.prefix}help [command]\` for details\n`;
      helpMessage += `⚡ *Bot Version*: ${config.app.version}\n`;
      helpMessage += `👨‍💻 *Author*: ${config.app.author}`;
      
      // Add quick replies for categories
      const quickReplies = Object.keys(commandsByCategory).map(category => ({
        content_type: 'text',
        title: category.charAt(0).toUpperCase() + category.slice(1),
        payload: `HELP_CATEGORY_${category.toUpperCase()}`,
      }));
      
      // Add all commands quick reply
      quickReplies.push({
        content_type: 'text',
        title: '📋 All Commands',
        payload: 'HELP_ALL_COMMANDS',
      });
      
      await fbApi.sendMessage(senderId, helpMessage, 'quick_replies', {
        quickReplies,
      });
      
    } catch (error) {
      console.error('Error in help command:', error);
      await fbApi.sendMessage(senderId, 
        'Sorry, I encountered an error showing the help menu.'
      );
    }
  },
};