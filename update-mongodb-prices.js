const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Kør med "node update-mongodb-prices.js"

// Definer Player schema
const playerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    club: { type: String, required: true },
    position: { type: String, required: true },
    price: { type: Number, required: true },
    points: { type: Number, default: 0 },
});

const Player = mongoose.models.Player || mongoose.model('Player', playerSchema);

async function updateMongoDBPrices() {
    try {
        // Forbind til MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/footballfantasy';
        console.log('╔═══════════════════════════════════════════════════════════════════╗');
        console.log('║          🚀 OPDATERING AF PRISER I MONGODB                       ║');
        console.log('╚═══════════════════════════════════════════════════════════════════╝\n');
        console.log('🔗 Forbinder til MongoDB...');
        console.log(`   URI: ${mongoUri.replace(/\/\/.*:.*@/, '//***:***@')}\n`);

        await mongoose.connect(mongoUri);
        console.log('✅ Forbundet til MongoDB!\n');

        // Læs teams-data.json (med de nye priser)
        const priceFilePath = path.join(__dirname, 'teams-data.json');
        console.log('📖 Læser teams-data.json (med nye priser)...');

        if (!fs.existsSync(priceFilePath)) {
            throw new Error(`❌ Kan ikke finde teams-data.json i: ${__dirname}`);
        }

        const priceData = JSON.parse(fs.readFileSync(priceFilePath, 'utf8'));
        console.log(`✅ Fandt ${priceData.length} spillere med priser\n`);

        // Byg et map med priser: key = "navn|klub" -> pris
        console.log('⚙️  Bygger pris-lookup map...');
        const priceMap = new Map();
        priceData.forEach(player => {
            const key = `${player.name}|${player.club}`;
            priceMap.set(key, player.price);
        });
        console.log(`✅ ${priceMap.size} unikke spillere i pris-map\n`);

        // Hent alle spillere fra databasen
        console.log('🔍 Henter spillere fra databasen...');
        const dbPlayers = await Player.find();
        console.log(`✅ Fandt ${dbPlayers.length} spillere i databasen\n`);

        if (dbPlayers.length === 0) {
            console.log('⚠️  ADVARSEL: Databasen er tom!');
            console.log('   Du skal først importere spillere til databasen.');
            console.log('   Brug "mongoimport" kommandoen eller start din applikation.\n');
            return;
        }

        // Forbered bulk opdateringer
        console.log('⚙️  Matcher spillere og forbereder opdateringer...\n');
        const bulkOps = [];
        let matchedCount = 0;
        let unchangedCount = 0;
        let notFoundCount = 0;
        const updatedExamples = [];
        const notFoundExamples = [];

        for (const dbPlayer of dbPlayers) {
            const key = `${dbPlayer.name}|${dbPlayer.club}`;
            const newPrice = priceMap.get(key);

            if (newPrice !== undefined) {
                matchedCount++;

                if (dbPlayer.price !== newPrice) {
                    bulkOps.push({
                        updateOne: {
                            filter: { _id: dbPlayer._id },
                            update: { $set: { price: newPrice } }
                        }
                    });

                    // Gem eksempel på ændring
                    if (updatedExamples.length < 5) {
                        updatedExamples.push({
                            name: dbPlayer.name,
                            club: dbPlayer.club,
                            position: dbPlayer.position,
                            oldPrice: dbPlayer.price,
                            newPrice: newPrice
                        });
                    }
                } else {
                    unchangedCount++;
                }
            } else {
                notFoundCount++;
                if (notFoundExamples.length < 5) {
                    notFoundExamples.push({
                        name: dbPlayer.name,
                        club: dbPlayer.club
                    });
                }
            }
        }

        // Vis matching resultat
        console.log('═'.repeat(70));
        console.log('📊 MATCHING RESULTAT:');
        console.log('═'.repeat(70));
        console.log(`✅ Matchede spillere:                    ${matchedCount.toString().padStart(6)}`);
        console.log(`🔄 Spillere der skal opdateres:          ${bulkOps.length.toString().padStart(6)}`);
        console.log(`ℹ️  Spillere med korrekt pris allerede:  ${unchangedCount.toString().padStart(6)}`);
        console.log(`❌ Ikke fundet i price-fil:              ${notFoundCount.toString().padStart(6)}`);
        console.log('═'.repeat(70));

        // Vis eksempler på opdateringer
        if (updatedExamples.length > 0) {
            console.log('\n📝 EKSEMPLER PÅ PRISÆNDRINGER:');
            console.log('─'.repeat(70));
            updatedExamples.forEach((ex, i) => {
                const oldFormatted = (ex.oldPrice / 1000000).toFixed(1);
                const newFormatted = (ex.newPrice / 1000000).toFixed(1);
                const change = ex.newPrice - ex.oldPrice;
                const changeFormatted = (change / 1000000).toFixed(1);
                const arrow = change > 0 ? '↑' : '↓';

                console.log(`${i + 1}. ${ex.name} (${ex.club})`);
                console.log(`   ${ex.position.padEnd(5)} ${oldFormatted} mill. → ${newFormatted} mill. ${arrow} ${Math.abs(changeFormatted)} mill.`);
            });
            console.log('─'.repeat(70));
        }

        // Vis spillere ikke fundet
        if (notFoundExamples.length > 0) {
            console.log('\n⚠️  SPILLERE I DB UDEN PRIS I PRICE-FIL:');
            console.log('─'.repeat(70));
            notFoundExamples.forEach(p => {
                console.log(`   • ${p.name} (${p.club})`);
            });
            if (notFoundCount > 5) {
                console.log(`   ... og ${notFoundCount - 5} flere`);
            }
            console.log('─'.repeat(70));
        }

        // Udfør opdatering
        if (bulkOps.length > 0) {
            console.log(`\n🔄 Opdaterer ${bulkOps.length} spillere i databasen...`);
            const result = await Player.bulkWrite(bulkOps);
            console.log(`✅ ${result.modifiedCount} spillere succesfuldt opdateret!\n`);
        } else {
            console.log('\n✅ Alle matchede spillere har allerede de rigtige priser!\n');
        }

        // Vis top spillere efter opdatering
        console.log('═'.repeat(70));
        console.log('💰 TOP 15 DYRESTE SPILLERE EFTER OPDATERING:');
        console.log('═'.repeat(70));
        const topPlayers = await Player.find({ price: { $gt: 0 } }).sort({ price: -1 }).limit(15);

        if (topPlayers.length === 0) {
            console.log('⚠️  Ingen spillere med pris > 0 fundet');
        } else {
            topPlayers.forEach((player, index) => {
                const formattedPrice = (player.price / 1000000).toFixed(1);
                const line = `${(index + 1).toString().padStart(2)}. ${player.name.padEnd(28)} ${player.position.padEnd(5)} ${formattedPrice.padStart(5)} mill.`;
                console.log(line);
            });
        }
        console.log('═'.repeat(70));

        // Vis prisstatistik
        console.log('\n📊 PRISSTATISTIK EFTER OPDATERING:');
        console.log('─'.repeat(70));

        const totalPlayers = await Player.countDocuments();
        const playersWithPrice = await Player.countDocuments({ price: { $gt: 0 } });
        const playersWithoutPrice = await Player.countDocuments({ price: 0 });

        console.log(`📦 Total spillere i databasen:           ${totalPlayers.toString().padStart(6)}`);
        console.log(`💰 Spillere med pris (> 0):              ${playersWithPrice.toString().padStart(6)}`);
        console.log(`⚪ Spillere uden pris (= 0):             ${playersWithoutPrice.toString().padStart(6)}`);

        // Beregn gennemsnitspris og andre statistikker
        if (playersWithPrice > 0) {
            const avgResult = await Player.aggregate([
                { $match: { price: { $gt: 0 } } },
                { $group: {
                        _id: null,
                        avgPrice: { $avg: '$price' },
                        minPrice: { $min: '$price' },
                        maxPrice: { $max: '$price' }
                    }}
            ]);

            if (avgResult.length > 0) {
                const avg = (avgResult[0].avgPrice / 1000000).toFixed(2);
                const min = (avgResult[0].minPrice / 1000000).toFixed(1);
                const max = (avgResult[0].maxPrice / 1000000).toFixed(1);

                console.log(`📊 Gennemsnitspris:                      ${avg.padStart(6)} mill.`);
                console.log(`📉 Laveste pris:                         ${min.padStart(6)} mill.`);
                console.log(`📈 Højeste pris:                         ${max.padStart(6)} mill.`);
            }
        }

        console.log('─'.repeat(70));

        console.log('\n✅ FÆRDIG! Priserne er nu opdateret i MongoDB.\n');

    } catch (error) {
        console.error('\n❌ FEJL UNDER OPDATERING:');
        console.error('═'.repeat(70));
        console.error(error.message);

        if (error.message.includes('connect ECONNREFUSED')) {
            console.error('\n💡 MongoDB kører ikke!');
            console.error('   Start MongoDB med: mongod');
        } else if (error.message.includes('authentication failed')) {
            console.error('\n💡 Forkert brugernavn eller password!');
            console.error('   Tjek din .env fil og MONGODB_URI');
        } else if (error.message.includes('ENOENT') || error.message.includes('Cannot find')) {
            console.error('\n💡 Filen teams-data.json blev ikke fundet!');
            console.error('   Sørg for at teams-data.json ligger i samme mappe som dette script.');
        }

        console.error('\n📋 Detaljeret fejl:');
        console.error(error);
    } finally {
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            console.log('👋 Forbindelse til MongoDB lukket.\n');
        }
    }
}

// Kør scriptet
updateMongoDBPrices();