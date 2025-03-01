// src/components/ZkpExplanation.tsx
'use client';

import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const ZkpExplanation = () => {
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  
  // Theme-based styles
  const getThemeClasses = () => {
    if (theme === 'dark') {
      return {
        bg: 'bg-[#2c2c2e]',
        borderColor: 'border-[#48484a]',
        text: 'text-white',
        mutedText: 'text-[#86868b]',
        codeBlock: 'bg-[#1c1c1e]',
        highlight: 'bg-[#0a84ff33]',
        button: 'bg-[#0a84ff] hover:bg-[#0070d8]'
      };
    } else {
      return {
        bg: 'bg-white',
        borderColor: 'border-gray-200',
        text: 'text-gray-800',
        mutedText: 'text-gray-500',
        codeBlock: 'bg-gray-100',
        highlight: 'bg-blue-100',
        button: 'bg-blue-500 hover:bg-blue-600'
      };
    }
  };
  
  const colors = getThemeClasses();
  
  // Explanation content in both languages
  const explanationContent = () => {
    if (language === 'fr') {
      return (
        <>
          <h3 className="text-xl font-bold mb-4">Comment Fonctionnent les Preuves à Connaissance Nulle</h3>
          
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-2">Les Bases du Système</h4>
            <p className="mb-3">Notre système permet aux musiciens de prouver qu'ils possèdent une mélodie sans jamais révéler les notes réelles. C'est comme prouver que vous connaissez le mot de passe sans jamais le dire à voix haute.</p>
            <p className="mb-3">La technologie qui rend cela possible s'appelle une "preuve à connaissance nulle" (ZKP), un concept cryptographique avancé qui fait partie des fondements de nombreuses blockchains modernes.</p>
          </div>
          
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-2">Flux du Processus</h4>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Vous créez une mélodie en utilisant le piano virtuel</li>
              <li>Les notes sont converties en valeurs MIDI (par exemple, C4 → 60)</li>
              <li>Un "sel" aléatoire est généré pour garantir l'unicité</li>
              <li>Le système calcule un hachage cryptographique à l'aide de la fonction Poseidon</li>
              <li>Une preuve mathématique est générée qui montre que vous connaissez les notes qui produisent ce hachage</li>
              <li>La preuve est vérifiée sur la blockchain, mais les notes réelles ne sont jamais partagées</li>
            </ol>
          </div>
          
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-2">Le Côté Mathématique</h4>
            <p className="mb-3">D'un point de vue mathématique, notre système utilise :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Algorithme de hachage <strong>Poseidon</strong> : optimisé pour les ZKP sur les blockchains</li>
              <li>Preuves <strong>Groth16</strong> : un système de preuve efficace et compact</li>
              <li>Circuits <strong>Circom</strong> : un langage qui définit les relations mathématiques que nos preuves doivent satisfaire</li>
            </ul>
            
            <div className={`${colors.codeBlock} p-3 rounded-md mt-3 font-mono text-xs overflow-auto`}>
              <p>// Formulation mathématique simplifiée</p>
              <p>hash = Poseidon([notes_midi, sel_aléatoire])</p>
              <p>preuve = Groth16.Prouver(circuit, [notes_midi, sel_aléatoire], hash)</p>
              <p>vérification = Groth16.Vérifier(preuve, hash) // Retourne vrai si valide</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-2">Propriétés Essentielles ZKP</h4>
            <div className={`${colors.highlight} p-3 rounded-md`}>
              <ol className="list-decimal pl-4 space-y-1">
                <li><strong>Complétude</strong> : Si vous connaissez vraiment la mélodie, vous pouvez toujours générer une preuve valide</li>
                <li><strong>Solidité</strong> : Si vous ne connaissez pas la mélodie, vous ne pouvez pas créer une preuve valide</li>
                <li><strong>Connaissance-nulle</strong> : La preuve ne révèle aucune information sur la mélodie elle-même</li>
              </ol>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-2">Applications Pratiques</h4>
            <p className="mb-3">Ce système peut être utilisé pour :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Établir la propriété des mélodies sans risque de vol</li>
              <li>Prouver l'antériorité en cas de litiges de droits d'auteur</li>
              <li>Partager des preuves d'ownership avec des maisons de disques ou des éditeurs</li>
              <li>Créer un registre vérifiable de créations musicales horodatées</li>
            </ul>
          </div>
        </>
      );
    } else {
      return (
        <>
          <h3 className="text-xl font-bold mb-4">How Zero-Knowledge Proofs Work</h3>
          
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-2">System Basics</h4>
            <p className="mb-3">Our system allows musicians to prove they own a melody without ever revealing the actual notes. It's like proving you know a password without ever saying it out loud.</p>
            <p className="mb-3">The technology that makes this possible is called a "zero-knowledge proof" (ZKP), an advanced cryptographic concept that forms the foundation of many modern blockchains.</p>
          </div>
          
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-2">Process Flow</h4>
            <ol className="list-decimal pl-5 space-y-2">
              <li>You create a melody using the virtual piano</li>
              <li>The notes are converted to MIDI values (e.g., C4 → 60)</li>
              <li>A random "salt" is generated to ensure uniqueness</li>
              <li>The system calculates a cryptographic hash using the Poseidon function</li>
              <li>A mathematical proof is generated that shows you know the notes that produce this hash</li>
              <li>The proof is verified on the blockchain, but the actual notes are never shared</li>
            </ol>
          </div>
          
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-2">The Math Behind It</h4>
            <p className="mb-3">From a mathematical perspective, our system uses:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Poseidon</strong> hash algorithm: optimized for ZKPs on blockchains</li>
              <li><strong>Groth16</strong> proofs: an efficient and compact proving system</li>
              <li><strong>Circom</strong> circuits: a language that defines the mathematical relationships our proofs must satisfy</li>
            </ul>
            
            <div className={`${colors.codeBlock} p-3 rounded-md mt-3 font-mono text-xs overflow-auto`}>
              <p>// Simplified mathematical formulation</p>
              <p>hash = Poseidon([notes_midi, random_salt])</p>
              <p>proof = Groth16.Prove(circuit, [notes_midi, random_salt], hash)</p>
              <p>verification = Groth16.Verify(proof, hash) // Returns true if valid</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-2">Essential ZKP Properties</h4>
            <div className={`${colors.highlight} p-3 rounded-md`}>
              <ol className="list-decimal pl-4 space-y-1">
                <li><strong>Completeness</strong>: If you truly know the melody, you can always generate a valid proof</li>
                <li><strong>Soundness</strong>: If you don't know the melody, you cannot create a valid proof</li>
                <li><strong>Zero-knowledge</strong>: The proof reveals no information about the melody itself</li>
              </ol>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-2">Practical Applications</h4>
            <p className="mb-3">This system can be used for:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Establishing ownership of melodies without risk of theft</li>
              <li>Proving prior art in copyright disputes</li>
              <li>Sharing ownership proofs with record labels or publishers</li>
              <li>Creating a verifiable registry of timestamped musical creations</li>
            </ul>
          </div>
        </>
      );
    }
  };
  
  return (
    <div className={`${colors.bg} border ${colors.borderColor} rounded-lg overflow-hidden transition-all duration-300 mt-8 shadow-lg`}>
      {/* Collapsible header */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-5 py-4 flex justify-between items-center ${colors.text} cursor-pointer hover:bg-opacity-90 transition-colors`}
        aria-expanded={isOpen}
      >
        <h3 className="text-xl font-bold">
          {language === 'fr' ? 'Comprendre la Technologie de Preuve à Connaissance Nulle' : 'Understanding Zero-Knowledge Proof Technology'}
        </h3>
        <div className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </button>
      
      {/* Collapsible content */}
      <div 
        className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className={`p-5 ${colors.text}`}>
          {explanationContent()}
        </div>
      </div>
    </div>
  );
};

export default ZkpExplanation;