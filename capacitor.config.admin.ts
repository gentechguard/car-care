import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.gentechguard.admin',
    appName: 'Gentech Admin',
    webDir: 'out',
    server: {
        androidScheme: 'https'
    }
};

export default config;
