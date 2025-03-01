// src/context/LanguageContext.tsx
'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';

type Language = 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string; // Translation function
}

// Create the context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionary
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    'app.title': 'Music ZKP System',
    'app.subtitle': 'Register and verify your melodies with zero-knowledge proofs',
    
    // Wallet connection
    'wallet.title': 'Wallet Connection',
    'wallet.connect': 'Connect Wallet',
    'wallet.connecting': 'Connecting...',
    'wallet.description': 'Connect your wallet to register and verify melodies.',
    'wallet.not_found': 'No Ethereum wallet detected. Please install MetaMask.',
    'wallet.download': 'Download MetaMask',
    'wallet.connected': 'Connected',
    'wallet.view': 'View on Etherscan',
    
    // Melody registration
    'register.title': 'Register a New Melody',
    'register.melody_name': 'Melody Name',
    'register.name_placeholder': 'Enter a name for your melody',
    'register.create_melody': 'Create Your Melody',
    'register.notes': 'notes',
    'register.selected_notes': 'Selected notes',
    'register.none': 'None',
    'register.clear_all': 'Clear All',
    'register.delete_last': 'Delete Last',
    'register.sequence': 'Sequence',
    'register.button': 'Register Melody',
    'register.processing': 'Processing...',
    
    // Status messages
    'status.salt': 'Generating random salt for your melody...',
    'status.midi': 'Converting your notes to MIDI values...',
    'status.hash': 'Computing cryptographic hash of your melody...',
    'status.hash_success': 'Hash created successfully!',
    'status.proof': 'Generating zero-knowledge proof...',
    'status.proof_success': 'Mathematical proof generated!',
    'status.blockchain': 'Sending to blockchain (check your wallet)...',
    'status.success': 'Melody registered successfully on the blockchain!',
    'status.transaction': 'Transaction ID',
    
    // Ownership alert
    'ownership.title': 'IMPORTANT: Save Your Ownership Proof',
    'ownership.description': 'This information is critical to prove your ownership in case of disputes. Save it securely - it will not be stored on the blockchain!',
    'ownership.melody_name': 'Melody Name',
    'ownership.notes': 'Notes',
    'ownership.salt': 'Salt Value (CRITICAL)',
    'ownership.hash': 'Melody Hash',
    'ownership.time': 'Registration Time',
    'ownership.tx_hash': 'Transaction Hash',
    'ownership.view': 'View',
    'ownership.download': 'Download PDF Certificate',
    'ownership.copy': 'Copy to Clipboard',
    'ownership.copy_success': 'Ownership details copied to clipboard!',
    
    // Verification
    'verify.title': 'Verify Melody Ownership',
    'verify.melody': 'Verify with Melody',
    'verify.hash': 'Hash',
    'verify.select_melody': 'Select Your Melody',
    'verify.salt_input': 'Salt Value (used during registration)',
    'verify.hash_input': 'Enter Melody Hash',
    'verify.hash_description': 'Enter the hash value of the melody you want to verify ownership for.',
    'verify.button': 'Verify Ownership',
    'verify.processing': 'Verifying...',
    'verify.computing': 'Computing Hash & Verifying...',
    'verify.result': 'Verification Result',
    'verify.status': 'Status',
    'verify.registered': 'Registered ✓',
    'verify.not_registered': 'Not Registered ✗',
    'verify.not_registered_message': 'Melody is not registered',
    'verify.owner': 'Owner',
    'verify.registered_on': 'Registered on',
    'verify.wallet_connected': 'Wallet Connected',
    'verify.wallet_not_connected': 'Wallet Not Connected',
    'verify.clear_logs': 'Clear Logs',
    'verify.process_log': 'Process Log',
    'verify.entries': 'entries',
    'verify.no_logs': 'No logs yet',
    'verify.close': 'Close',
    'verify.copy_hash': 'Copy Hash',
    'verify.view_on_etherscan': 'View on Etherscan',
    'verify.none': 'None',
    'verify.error_notes': 'Please select exactly 8 notes for your melody',
    'verify.error_salt': 'Please enter a salt value',
    'verify.error_salt_format': 'Salt must be a valid numeric value',
    'verify.computing_hash': 'Computing hash from notes and salt...',
    'verify.notes_midi': 'Notes converted to MIDI',
    'verify.hash_calculated': 'Hash calculated',
    'verify.hash_error': 'Hash calculation error',
    'verify.unknown_error': 'Unknown error',
    'verify.no_hash': 'No hash provided for verification',
    'verify.verifying_ownership': 'Verifying ownership for hash',
    'verify.no_wallet': 'No Ethereum wallet found. Please install MetaMask.',
    'verify.connecting': 'Connecting to provider...',
    'verify.creating_contract': 'Creating contract instance...',
    'verify.querying_owner': 'Querying contract for owner...',
    'verify.owner_address': 'Owner address',
    'verify.fetching_timestamp': 'Fetching registration timestamp...',
    'verify.registration_time': 'Registration time',
    'verify.verification_error': 'Verification error',
    'verify.error_no_hash': 'Please enter a hash to verify',
    'verify.using_provided_hash': 'Using provided hash for verification',
    'verify.computing_from_melody': 'Computing hash from melody and salt first',
    'verify.verification_failed': 'Verification failed',
    'verify.error': 'Error',
    'verify.hash_copied': 'Hash copied to clipboard',
    'verify.salt_placeholder': 'Enter the salt value you used when registering',
    'verify.hash_placeholder': 'Paste the melody hash here',
    
    // About section
    'about.title': 'About This Project',
    'about.description': 'This decentralized application allows you to register ownership of musical melodies without ever revealing the actual notes to anyone else.',
    'about.how_it_works': 'How It Works',
    'about.step1': 'You create a melody using the on-screen piano',
    'about.step2': 'The app creates a cryptographic hash of your melody along with a random salt',
    'about.step3': 'A zero-knowledge proof is generated that proves you know the melody without revealing the notes',
    'about.step4': 'This proof is verified on the blockchain, establishing your ownership',
    'about.benefits': 'Benefits',
    'about.benefit1': 'Establish verifiable ownership without exposing your creative work',
    'about.benefit2': 'Secure timestamped proof of your musical ideas',
    'about.benefit3': 'Protect against unauthorized copying while still being able to prove ownership',
    'about.tech': 'This project uses zero-knowledge proofs built with Circom, and smart contracts deployed on the Sepolia testnet.',
    
    // Certificate
    'certificate.title': 'MELODY OWNERSHIP CERTIFICATE',
    'certificate.subtitle': 'Secured by Zero-Knowledge Proofs & Blockchain Technology',
    'certificate.details': 'CERTIFICATE DETAILS',
    'certificate.melody_name': 'Melody Name',
    'certificate.notes': 'Notes Sequence',
    'certificate.registered_by': 'Registered By',
    'certificate.time': 'Registration Time',
    'certificate.salt': 'Salt Value (CRITICAL)',
    'certificate.hash': 'Melody Hash',
    'certificate.tx_hash': 'Transaction Hash',
    'certificate.notice_title': 'IMPORTANT NOTICE',
    'certificate.notice': 'Keep this certificate secure and confidential. The salt value is required to prove your ownership of this melody. This certificate serves as cryptographic proof of your melody registration on the blockchain.',
    'certificate.verify_title': 'HOW TO VERIFY OWNERSHIP',
    'certificate.verify_step1': '1. Visit the Music ZKP System website',
    'certificate.verify_step2': '2. Go to the Verification section',
    'certificate.verify_step3': '3. Enter your melody notes and salt value',
    'certificate.verify_step4': '4. The system will compute the hash and verify ownership',
    'certificate.footer': 'This certificate was automatically generated by the Music ZKP System',
    'certificate.id': 'Certificate ID',
    'certificate.generated': 'Generated on',
    
    // Language selector
    'language.select': 'Language',
    'language.en': 'English',
    'language.fr': 'French',
    
    // User melodies
    'melodies.title': 'Your Registered Melodies',
    'melodies.connect_wallet': 'Connect your wallet to view your registered melodies.',
    'melodies.none': 'You haven\'t registered any melodies yet.',
    'melodies.loading': 'Loading your melodies...',
    'melodies.melody_number': 'Melody #',
    'melodies.hash': 'Hash',
    'melodies.registered_on': 'Registered on',
    'melodies.view_transaction': 'View Transaction',
    'melodies.no_transaction': 'Transaction data not available'
  },
  fr: {
    // Header
    'app.title': 'Système ZKP Musical',
    'app.subtitle': 'Enregistrez et vérifiez vos mélodies avec des preuves à connaissance nulle',
    
    // Wallet connection
    'wallet.title': 'Connexion du Portefeuille',
    'wallet.connect': 'Connecter Portefeuille',
    'wallet.connecting': 'Connexion en cours...',
    'wallet.description': 'Connectez votre portefeuille pour enregistrer et vérifier des mélodies.',
    'wallet.not_found': 'Aucun portefeuille Ethereum détecté. Veuillez installer MetaMask.',
    'wallet.download': 'Télécharger MetaMask',
    'wallet.connected': 'Connecté',
    'wallet.view': 'Voir sur Etherscan',
    
    // Melody registration
    'register.title': 'Enregistrer une Nouvelle Mélodie',
    'register.melody_name': 'Nom de la Mélodie',
    'register.name_placeholder': 'Entrez un nom pour votre mélodie',
    'register.create_melody': 'Créez Votre Mélodie',
    'register.notes': 'notes',
    'register.selected_notes': 'Notes sélectionnées',
    'register.none': 'Aucune',
    'register.clear_all': 'Tout Effacer',
    'register.delete_last': 'Supprimer Dernière',
    'register.sequence': 'Séquence',
    'register.button': 'Enregistrer la Mélodie',
    'register.processing': 'Traitement en cours...',
    
    // Status messages
    'status.salt': 'Génération d\'un sel aléatoire pour votre mélodie...',
    'status.midi': 'Conversion de vos notes en valeurs MIDI...',
    'status.hash': 'Calcul du hachage cryptographique de votre mélodie...',
    'status.hash_success': 'Hachage créé avec succès!',
    'status.proof': 'Génération de la preuve à connaissance nulle...',
    'status.proof_success': 'Preuve mathématique générée!',
    'status.blockchain': 'Envoi à la blockchain (vérifiez votre portefeuille)...',
    'status.success': 'Mélodie enregistrée avec succès sur la blockchain!',
    'status.transaction': 'ID de transaction',
    
    // Ownership alert
    'ownership.title': 'IMPORTANT : Sauvegardez Votre Preuve de Propriété',
    'ownership.description': 'Ces informations sont essentielles pour prouver votre propriété en cas de litiges. Conservez-les en sécurité - elles ne seront pas stockées sur la blockchain!',
    'ownership.melody_name': 'Nom de la Mélodie',
    'ownership.notes': 'Notes',
    'ownership.salt': 'Valeur de Sel (CRITIQUE)',
    'ownership.hash': 'Hachage de la Mélodie',
    'ownership.time': 'Date d\'Enregistrement',
    'ownership.tx_hash': 'Hachage de Transaction',
    'ownership.view': 'Voir',
    'ownership.download': 'Télécharger le Certificat PDF',
    'ownership.copy': 'Copier dans le Presse-papiers',
    'ownership.copy_success': 'Détails de propriété copiés dans le presse-papiers!',
    
    // Verification
    'verify.title': 'Vérifier la Propriété de la Mélodie',
    'verify.melody': 'Vérifier avec Mélodie',
    'verify.hash': 'Hachage',
    'verify.select_melody': 'Sélectionnez Votre Mélodie',
    'verify.salt_input': 'Valeur de Sel (utilisée lors de l\'enregistrement)',
    'verify.hash_input': 'Entrez le Hachage de la Mélodie',
    'verify.hash_description': 'Entrez la valeur de hachage de la mélodie dont vous souhaitez vérifier la propriété.',
    'verify.button': 'Vérifier la Propriété',
    'verify.processing': 'Vérification en cours...',
    'verify.computing': 'Calcul du Hachage et Vérification...',
    'verify.result': 'Résultat de la Vérification',
    'verify.status': 'Statut',
    'verify.registered': 'Enregistré ✓',
    'verify.not_registered': 'Non Enregistré ✗',
    'verify.not_registered_message': 'La mélodie n\'est pas enregistrée',
    'verify.owner': 'Propriétaire',
    'verify.registered_on': 'Enregistré le',
    'verify.wallet_connected': 'Portefeuille Connecté',
    'verify.wallet_not_connected': 'Portefeuille Non Connecté',
    'verify.clear_logs': 'Effacer les Journaux',
    'verify.process_log': 'Journal de Processus',
    'verify.entries': 'entrées',
    'verify.no_logs': 'Pas encore de journaux',
    'verify.close': 'Fermer',
    'verify.copy_hash': 'Copier le Hachage',
    'verify.view_on_etherscan': 'Voir sur Etherscan',
    'verify.none': 'Aucun',
    'verify.error_notes': 'Veuillez sélectionner exactement 8 notes pour votre mélodie',
    'verify.error_salt': 'Veuillez entrer une valeur de sel',
    'verify.error_salt_format': 'Le sel doit être une valeur numérique valide',
    'verify.computing_hash': 'Calcul du hachage à partir des notes et du sel...',
    'verify.notes_midi': 'Notes converties en MIDI',
    'verify.hash_calculated': 'Hachage calculé',
    'verify.hash_error': 'Erreur de calcul du hachage',
    'verify.unknown_error': 'Erreur inconnue',
    'verify.no_hash': 'Aucun hachage fourni pour la vérification',
    'verify.verifying_ownership': 'Vérification de la propriété pour le hachage',
    'verify.no_wallet': 'Aucun portefeuille Ethereum trouvé. Veuillez installer MetaMask.',
    'verify.connecting': 'Connexion au fournisseur...',
    'verify.creating_contract': 'Création de l\'instance du contrat...',
    'verify.querying_owner': 'Interrogation du contrat pour le propriétaire...',
    'verify.owner_address': 'Adresse du propriétaire',
    'verify.fetching_timestamp': 'Récupération de l\'horodatage d\'enregistrement...',
    'verify.registration_time': 'Heure d\'enregistrement',
    'verify.verification_error': 'Erreur de vérification',
    'verify.error_no_hash': 'Veuillez entrer un hachage à vérifier',
    'verify.using_provided_hash': 'Utilisation du hachage fourni pour la vérification',
    'verify.computing_from_melody': 'Calcul du hachage à partir de la mélodie et du sel d\'abord',
    'verify.verification_failed': 'La vérification a échoué',
    'verify.error': 'Erreur',
    'verify.hash_copied': 'Hachage copié dans le presse-papiers',
    'verify.salt_placeholder': 'Entrez la valeur de sel que vous avez utilisée lors de l\'enregistrement',
    'verify.hash_placeholder': 'Collez le hachage de la mélodie ici',
    
    // About section
    'about.title': 'À Propos de Ce Projet',
    'about.description': 'Cette application décentralisée vous permet d\'enregistrer la propriété de mélodies musicales sans jamais révéler les notes réelles à quiconque.',
    'about.how_it_works': 'Comment Ça Fonctionne',
    'about.step1': 'Vous créez une mélodie en utilisant le piano à l\'écran',
    'about.step2': 'L\'application crée un hachage cryptographique de votre mélodie avec un sel aléatoire',
    'about.step3': 'Une preuve à connaissance nulle est générée, prouvant que vous connaissez la mélodie sans révéler les notes',
    'about.step4': 'Cette preuve est vérifiée sur la blockchain, établissant votre propriété',
    'about.benefits': 'Avantages',
    'about.benefit1': 'Établir une propriété vérifiable sans exposer votre travail créatif',
    'about.benefit2': 'Preuve horodatée sécurisée de vos idées musicales',
    'about.benefit3': 'Protection contre la copie non autorisée tout en pouvant prouver la propriété',
    'about.tech': 'Ce projet utilise des preuves à connaissance nulle construites avec Circom et des contrats intelligents déployés sur le réseau de test Sepolia.',
    
    // Certificate
    'certificate.title': 'CERTIFICAT DE PROPRIÉTÉ DE MÉLODIE',
    'certificate.subtitle': 'Sécurisé par Preuves à Connaissance Nulle & Technologie Blockchain',
    'certificate.details': 'DÉTAILS DU CERTIFICAT',
    'certificate.melody_name': 'Nom de la Mélodie',
    'certificate.notes': 'Séquence de Notes',
    'certificate.registered_by': 'Enregistré Par',
    'certificate.time': 'Date d\'Enregistrement',
    'certificate.salt': 'Valeur de Sel (CRITIQUE)',
    'certificate.hash': 'Hachage de la Mélodie',
    'certificate.tx_hash': 'Hachage de Transaction',
    'certificate.notice_title': 'AVIS IMPORTANT',
    'certificate.notice': 'Gardez ce certificat sécurisé et confidentiel. La valeur de sel est nécessaire pour prouver votre propriété de cette mélodie. Ce certificat sert de preuve cryptographique de votre enregistrement de mélodie sur la blockchain.',
    'certificate.verify_title': 'COMMENT VÉRIFIER LA PROPRIÉTÉ',
    'certificate.verify_step1': '1. Visitez le site Web du Système ZKP Musical',
    'certificate.verify_step2': '2. Allez à la section Vérification',
    'certificate.verify_step3': '3. Entrez vos notes de mélodie et la valeur de sel',
    'certificate.verify_step4': '4. Le système calculera le hachage et vérifiera la propriété',
    'certificate.footer': 'Ce certificat a été généré automatiquement par le Système ZKP Musical',
    'certificate.id': 'ID du Certificat',
    'certificate.generated': 'Généré le',
    
    // Language selector
    'language.select': 'Langue',
    'language.en': 'Anglais',
    'language.fr': 'Français',
    
    // User melodies
    'melodies.title': 'Vos Mélodies Enregistrées',
    'melodies.connect_wallet': 'Connectez votre portefeuille pour voir vos mélodies enregistrées.',
    'melodies.none': 'Vous n\'avez pas encore enregistré de mélodies.',
    'melodies.loading': 'Chargement de vos mélodies...',
    'melodies.melody_number': 'Mélodie #',
    'melodies.hash': 'Hachage',
    'melodies.registered_on': 'Enregistrée le',
    'melodies.view_transaction': 'Voir la Transaction',
    'melodies.no_transaction': 'Données de transaction non disponibles'
  }
};

export const LanguageProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // Default to browser language or English
  const getBrowserLanguage = (): Language => {
    if (typeof navigator === 'undefined') return 'en';
    const browserLang = navigator.language.split('-')[0];
    return (browserLang === 'fr') ? 'fr' : 'en';
  };
  
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);
  
  // Initialize once mounted on client side
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    setLanguageState(savedLanguage || getBrowserLanguage());
    setMounted(true);
  }, []);
  
  // Save language preference
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
  };
  
  // Translation function
  const t = (key: string): string => {
    if (!translations[language][key]) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translations[language][key];
  };
  
  // Show a loading state until client-side code is executed
  if (!mounted) {
    return <>{children}</>;
  }
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context - SSR-safe version
export const useLanguage = () => {
  // Check if we're in a browser environment
  const isClient = typeof window !== 'undefined';
  const context = useContext(LanguageContext);
  
  // For server-side rendering or when context isn't available yet,
  // return a fallback context that won't throw errors
  if (context === undefined) {
    // If we're on the server or the provider hasn't mounted yet,
    // return a default implementation that won't break rendering
    return {
      language: 'en',
      setLanguage: () => {}, // No-op function
      t: (key: string) => key // Return the key itself as fallback
    };
  }
  
  return context;
};