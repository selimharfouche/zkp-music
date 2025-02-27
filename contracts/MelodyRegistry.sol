// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./MelodyVerifier.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MelodyRegistry
 * @dev Registers and manages ownership of melody hashes
 * 
 * This contract allows users to:
 * 1. Register new melodies with ZK proof verification
 * 2. Transfer ownership of melodies
 * 3. Check ownership of melodies
 */
contract MelodyRegistry is Ownable {
    MelodyVerifier public verifier;
    
    // Mapping from melody hash to owner
    mapping(uint256 => address) public melodyOwners;
    
    // Mapping from melody hash to registration time
    mapping(uint256 => uint256) public registrationTimes;
    
    // All registered melody hashes by a specific user
    mapping(address => uint256[]) public userMelodies;
    
    // Events
    event MelodyRegistered(uint256 indexed melodyHash, address indexed owner, uint256 timestamp);
    event MelodyTransferred(uint256 indexed melodyHash, address indexed previousOwner, address indexed newOwner);
    
    constructor(address _verifierAddress) Ownable(msg.sender) {
        verifier = MelodyVerifier(_verifierAddress);
    }
    
    /**
     * @dev Registers a new melody with proof verification
     * @param a Part of the ZK proof
     * @param b Part of the ZK proof
     * @param c Part of the ZK proof
     * @param input The public input (hash of the melody)
     */
    function registerMelody(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[1] memory input
    ) external {
        uint256 melodyHash = input[0];
        
        // Ensure melody isn't already registered
        require(melodyOwners[melodyHash] == address(0), "Melody already registered");
        
        // Verify that the sender knows the melody using ZK proof
        bool isValid = verifier.verifyProof(a, b, c, input);
        require(isValid, "Invalid proof");
        
        // Register the melody
        melodyOwners[melodyHash] = msg.sender;
        registrationTimes[melodyHash] = block.timestamp;
        userMelodies[msg.sender].push(melodyHash);
        
        emit MelodyRegistered(melodyHash, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Transfers ownership of a melody to another address
     * @param melodyHash The hash of the melody
     * @param newOwner The address to transfer ownership to
     */
    function transferMelody(uint256 melodyHash, address newOwner) external {
        require(melodyOwners[melodyHash] == msg.sender, "Not the owner");
        require(newOwner != address(0), "New owner cannot be zero address");
        
        address previousOwner = melodyOwners[melodyHash];
        melodyOwners[melodyHash] = newOwner;
        
        // Add to new owner's list
        userMelodies[newOwner].push(melodyHash);
        
        // Remove from previous owner's list
        uint256[] storage previousOwnerMelodies = userMelodies[previousOwner];
        for (uint i = 0; i < previousOwnerMelodies.length; i++) {
            if (previousOwnerMelodies[i] == melodyHash) {
                // Replace with the last element and pop
                previousOwnerMelodies[i] = previousOwnerMelodies[previousOwnerMelodies.length - 1];
                previousOwnerMelodies.pop();
                break;
            }
        }
        
        emit MelodyTransferred(melodyHash, previousOwner, newOwner);
    }
    
    /**
     * @dev Gets the count of melodies owned by an address
     * @param owner The address to check
     * @return The number of melodies owned
     */
    function getMelodyCount(address owner) external view returns (uint256) {
        return userMelodies[owner].length;
    }
    
    /**
     * @dev Checks if a melody is registered
     * @param melodyHash The hash of the melody
     * @return True if the melody is registered
     */
    function isMelodyRegistered(uint256 melodyHash) external view returns (bool) {
        return melodyOwners[melodyHash] != address(0);
    }
    
    /**
     * @dev Gets the owner of a melody
     * @param melodyHash The hash of the melody
     * @return The address of the owner
     */
    function getMelodyOwner(uint256 melodyHash) external view returns (address) {
        return melodyOwners[melodyHash];
    }
    
    /**
     * @dev Gets registration time of a melody
     * @param melodyHash The hash of the melody
     * @return The timestamp of registration
     */
    function getRegistrationTime(uint256 melodyHash) external view returns (uint256) {
        return registrationTimes[melodyHash];
    }
}