const { Client, GatewayIntentBits } = require("discord.js");
const db = require("croxydb");

const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
  name: "çekiliş-başlat",
  description: "Yeni bir çekiliş başlatır!",
  type: 1,
  options: [
    {
      name: "odul",
      description: "Çekilişin ödülü",
      type: 3,
      required: true
    },
    {
      name: "sure",
      description: "Çekilişin süresi (saniye cinsinden)",
      type: 4, // Type 4, bir sayıdır.
      required: true
    }
  ],
  run: async(client, interaction) => {
    const odul = interaction.options.getString('odul');
    const sure = interaction.options.getInteger('sure');
    
    // Çekiliş bilgilerini veritabanına kaydet
    const cekilisData = {
      odul: odul,
      hosted: interaction.user.id,
      mesajid: null // Çekiliş mesajının ID'si, henüz oluşturulmadığı için null
    };
    const cekilisKey = `cekilis_${interaction.user.id}_${Date.now()}`;
    db.set(cekilisKey, cekilisData);
    
    // Çekiliş mesajını oluştur
    const embed = new MessageEmbed()
      .setTitle(odul)
      .setColor("#5865f2")
      .setDescription(`Çekilişe Katılmak İçin Tıklayın!`)
      .setFooter(`Çekiliş Süresi: ${sure} saniye`)
      .setTimestamp();
    
    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('katilButton')
          .setLabel('Katıl')
          .setStyle('PRIMARY')
      );

    const msg = await interaction.channel.send({ embeds: [embed], components: [row] });
    
    // Çekiliş bilgilerini güncelle
    cekilisData.mesajid = msg.id;
    db.set(cekilisKey, cekilisData);
    
    // Çekilişi bitirecek komutun ID'si
    const bitirKomutID = "çekiliş-bitir"; // Kendi komutunuzun adını ve ID'sini kullanın.
    
    // Çekiliş bitirme komutunu oluştur
    const bitirKomut = client.commands.get(bitirKomutID);
    
    // Çekiliş bitirme komutunu çağır
    bitirKomut.run(client, interaction);
    
    interaction.reply(`Çekiliş başlatıldı!`);
  }
};
