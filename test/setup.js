function splitSchemaSQL(sql) {
    return sql
        .replace(/\r\n/g, ' ')      // normalize line endings
        .replace(/\n/g, ' ')        // remove all newlines
        .split(';')
        .map(s => s.trim())
        .filter(Boolean);
};

// Special split for seed.sql: removes comments and flattens multiline inserts
function splitSeedSQL(sql) {
    /** Because the seed.sql looks like this, it has more indents than the schema.sql
    
    INSERT INTO CatSounds (Transcript, SoundGroup, SoundFileName, SoundLicence, OriginalLink)
    VALUES
        (
            'Meow',
            'happy',
            '<link to sound file>',
            '<license for the sound file>',
            '<original link>'
        ),
        (
            'Meow',
            'happy',
            '<link to sound file>',
            '<license for the sound file>',
            '<original link>'
        ),
        ...
    */
    // Remove -- comments
    const noComments = sql.replace(/--.*$/gm, '');
    
    // Split by semicolon
    const statements = noComments.split(';');

    // Trim and flatten each statement to one line
    return statements
        .map(s => s.replace(/\r?\n/g, ' ').trim())
        .filter(Boolean);
}

import schemaSQL from './database/schema.sql?raw';
import seedSQL from './database/seed.sql?raw';

import { env } from 'cloudflare:test';
import { beforeAll } from 'vitest';

beforeAll(async () => {
    for (var stmt of splitSchemaSQL(schemaSQL)) {
        await env.cat_sounds_data.exec(stmt);
    };
    for (var stmt of splitSeedSQL(seedSQL)) {
        await env.cat_sounds_data.exec(stmt);
    };
})
