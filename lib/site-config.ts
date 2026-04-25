export const siteConfig = {
    company: {
        name: "Gentech Car Care",
        legalName: "Gentech Car Care Pvt Ltd",
        copyright: "© 2025 Gentech Car Care™. All Rights Reserved.",
        trademarkNotice: "™ denotes an unregistered trademark. Registration pending."
    },
    contact: {
        phone: {
            display: "+91 99893 67878",
            value: "+919989367878", // For tel: links
        },
        email: "support@gentechcarcare.com",
        address: {
            line1: "Gentech Signature Studio",
            line2: "Hyderabad, Telangana",
            fullAddress: "Gentech Signature Studio, Hyderabad, Telangana, India",
            mapLink: "https://www.google.com/maps/place/GENTECH+SIGNATURE+STUDIO/@17.3893411,78.3619729,764m/data=!3m2!1e3!4b1!4m6!3m5!1s0x3bcb95007f690305:0x6c021b6b78cfe3cd!8m2!3d17.3893411!4d78.3619729!16s%2Fg%2F11nbjfjpg1?entry=ttu"
        },
        whatsapp: {
            number: "919989367878",
            defaultMessage: "Hi, I'm interested in becoming a dealer."
        }
    },
    socials: {
        instagram: "https://www.instagram.com/gentech_signature_studio/",
        facebook: "https://www.facebook.com/gentechsignaturestudio",
        youtube: "https://youtube.com/@gentechguard"
    },
    navigation: [
        { name: "Home", href: "/home" },
        { name: "Services", href: "/home#product-showcase" },
        { name: "Process", href: "/home#process" },
        { name: "Gallery", href: "/gallery" },
    ],
    // Fallback products if DB fails or for static generation references
    productCategories: [
        "Gen 4 PPF",
        "Gen 5 PPF",
        "Gen Matte 5",
        "Gen Pro 6+",
        "Gen Pro Ultra 8"
    ],
    metadata: {
        title: "Gentech Car Care | Premium Paint Protection Film",
        description: "Premium Automotive Protection Solutions"
    }
};

export type SiteConfig = typeof siteConfig;
