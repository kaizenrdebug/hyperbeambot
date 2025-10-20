import discord
from discord.ext import commands
from discord import app_commands
import os

intents = discord.Intents.default()
intents.message_content = False
bot = commands.Bot(command_prefix='!', intents=intents)

@bot.event
async def on_ready():
    try:
        synced = await bot.tree.sync()
        print(f'Synced {len(synced)} command(s)')
    except Exception as e:
        print(e)

@bot.tree.command(name='tutorials', description='Get tutorials for private server setup')
@app_commands.describe(option='Choose a tutorial type')
@app_commands.choices(option=[
    app_commands.Choice(name='Private Server Tut', value='private'),
    app_commands.Choice(name='YouTube Tutorial', value='yt'),
    app_commands.Choice(name='Dual Hook Method', value='dual')
])
async def tutorials(interaction: discord.Interaction, option: str):
    embed = discord.Embed(title='Tutorials <:Verified:1429128618801365113>', color=0x00ff00)
    if option == 'private':
        pages = [
            discord.Embed(title='<:Verified:1429128618801365113> Private Server Tutorial (1/3)', description='**Text-based guide:**', color=0x00ff00),
            discord.Embed(title='<:Verified:1429128618801365113> Private Server Tutorial (2/3)', description='**Continued:**', color=0x00ff00),
            discord.Embed(title='<:Verified:1429128618801365113> Private Server Tutorial (3/3)', description='**Final Steps:**', color=0x00ff00)
        ]
        pages[0].add_fields(
            {'name': '1. Go to our page', 'value': 'Go to our page on ⁠❖・☂️site', 'inline': False},
            {'name': '2. Log in', 'value': 'Log in with your discord account (only asks for username)', 'inline': False},
            {'name': '3. Configuration', 'value': 'Go to the icon of configuration and use robiox.tg domain', 'inline': False},
            {'name': '4. Games section', 'value': 'Go to the button that says "Games" and click on it', 'inline': False},
            {'name': '5. Select game', 'value': 'Select the game u want, click it and then click the button that says copy url', 'inline': False}
        )
        pages[1].add_fields(
            {'name': '6. Shorten URL', 'value': 'Once you have it go to [tinyurl.com](https://tinyurl.com) and paste the link that you copied before', 'inline': False},
            {'name': '7. Follow image guide', 'value': 'Now do what I show in the image below', 'inline': False},
            {'name': '8. Image Reference', 'value': '[View Image](https://cdn.discordapp.com/attachments/1429052404405370880/1429053384417218752/image.png?ex=68f7602d&is=68f60ead&hm=a2cad2c738c81ccd83bd5c132c4055be921dd272e81f2db954e1955fd92701a7&)', 'inline': False}
        )
        pages[1].set_image(url='https://cdn.discordapp.com/attachments/1429052404405370880/1429053384417218752/image.png?ex=68f7602d&is=68f60ead&hm=a2cad2c738c81ccd83bd5c132c4055be921dd272e81f2db954e1955fd92701a7&')
        pages[2].add_fields(
            {'name': '9. Final Input', 'value': 'Type what I show in the image and then replace "https://tinyurl.com/" with your link\n\n[Test Hyperlink Tool](https://omegabeam-hyperlink.netlify.app/)\n[Main Website](https://shorturl.at/jiifG)', 'inline': False}
        )
        pages[2].set_footer(text='Thats it! HAPPY BEAMING! <:gold:1429116539680067646>')
        await interaction.response.send_message(embed=pages[0], ephemeral=False)
        for page in pages[1:]:
            await interaction.followup.send(embed=page, ephemeral=False)
    elif option == 'yt':
        embed.add_field(name='YouTube Tutorial', value='[Watch the video tutorial here](https://cdn.discordapp.com/attachments/1429052404405370880/1429053384417218752/image.png?ex=68f7602d&is=68f60ead&hm=a2cad2c738c81ccd83bd5c132c4055be921dd272e81f2db954e1955fd92701a7&)', inline=False)
        embed.set_footer(text='HAPPY BEAMING! <:gold:1429116539680067646>')
        await interaction.response.send_message(embed=embed, ephemeral=False)
    elif option == 'dual':
        embed.add_fields(
            {'name': 'Step 1: Create Beam Server', 'value': 'Create a Beam server where you teach members how to beam. At the same time, you\'ll be stealing their beams.', 'inline': False},
            {'name': 'Step 2: Use Template', 'value': 'Create a server using the template below. You can perform a reset.', 'inline': False},
            {'name': 'Step 3: Advertise or whatever ts is', 'value': 'Once you\'re done with your entire server, try to associate with as many beam servers as you can, invite your friends, and even secretly steal members from different beam servers. FOR GOOD AND QUICK ADVERTISING YOU CAN MAKE A YOUTUBE VIDEO!', 'inline': False},
            {'name': 'Server Template', 'value': '[Create Template :D](https://discord.new/Cg2G6AdH6ZkR)', 'inline': False}
        )
        embed.set_footer(text='HAPPY BEAMING! <:gold:1429116539680067646>')
        await interaction.response.send_message(embed=embed, ephemeral=False)

@bot.tree.command(name='method', description='Get the main method guide')
async def method(interaction: discord.Interaction):
    embed = discord.Embed(title='Main Method <:Verified:1429128618801365113>', description='[Read the full guide here](https://ptb.discord.com/channels/1406868498772398091/1428791488866947132)\n\nNGA DONT BE LAZY ASF AND START READING', color=0x00ff00)
    embed.add_field(name='Extra Tools', value='[Test Hyperlink](https://omegabeam-hyperlink.netlify.app/)\n[Main Website](https://shorturl.at/jiifG)', inline=False)
    embed.set_footer(text='HAPPY BEAMING! <:gold:1429116539680067646>')
    await interaction.response.send_message(embed=embed, ephemeral=False)

@bot.tree.command(name='ban', description='Ban a user')
@app_commands.describe(user='The user to ban', reason='Reason for ban')
async def ban(interaction: discord.Interaction, user: discord.Member, reason: str = 'No reason provided'):
    if not (any(role.name == 'Moderator' for role in interaction.user.roles) or interaction.user.guild_permissions.administrator or interaction.user.guild_permissions.ban_members):
        await interaction.response.send_message('Stupid nigga, be a mod first', ephemeral=True)
        return
    try:
        await user.ban(reason=reason)
        embed = discord.Embed(title='User Banned', description=f'Banned {user.mention} for: {reason}', color=0xff0000)
        await interaction.response.send_message(embed=embed)
    except Exception:
        await interaction.response.send_message('Failed to ban user.', ephemeral=True)

if __name__ == '__main__':
    bot.run(os.getenv('DISCORD_TOKEN'))
