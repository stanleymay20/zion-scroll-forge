// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ScrollGold Token
 * @dev Divine academic currency for ScrollUniversity
 * "I counsel you to buy from me gold refined by fire" - Revelation 3:18
 */
contract ScrollGold is ERC20, ERC20Burnable, Pausable, Ownable {
    // Maximum supply cap: 10 billion tokens
    uint256 public constant MAX_SUPPLY = 10_000_000_000 * 10**18;
    
    // Token pools
    uint256 public rewardPool;
    uint256 public scholarshipPool;
    uint256 public reservePool;
    uint256 public totalBurned;
    
    // Reward tracking
    mapping(address => uint256) public lifetimeEarned;
    mapping(address => uint256) public lifetimeSpent;
    mapping(address => bool) public isRewardIssuer;
    
    // Events
    event RewardAwarded(address indexed recipient, uint256 amount, string reason);
    event ScholarshipGranted(address indexed recipient, uint256 amount, string program);
    event TuitionPaid(address indexed student, uint256 amount, string courseId);
    event PoolFunded(string poolName, uint256 amount);
    event RewardIssuerAdded(address indexed issuer);
    event RewardIssuerRemoved(address indexed issuer);
    
    constructor() ERC20("ScrollGold", "SGD") {
        // Initial mint: 1 billion tokens
        uint256 initialSupply = 1_000_000_000 * 10**18;
        
        // Distribute initial supply
        rewardPool = (initialSupply * 40) / 100;      // 40% - 400M
        scholarshipPool = (initialSupply * 30) / 100; // 30% - 300M
        reservePool = (initialSupply * 20) / 100;     // 20% - 200M
        uint256 operations = (initialSupply * 10) / 100; // 10% - 100M
        
        // Mint to contract for pool management
        _mint(address(this), rewardPool + scholarshipPool + reservePool);
        
        // Mint operations to owner
        _mint(msg.sender, operations);
        
        // Owner is initial reward issuer
        isRewardIssuer[msg.sender] = true;
    }
    
    /**
     * @dev Modifier to restrict functions to reward issuers
     */
    modifier onlyRewardIssuer() {
        require(isRewardIssuer[msg.sender] || msg.sender == owner(), "Not authorized to issue rewards");
        _;
    }
    
    /**
     * @dev Add a reward issuer (backend service, admin)
     */
    function addRewardIssuer(address issuer) external onlyOwner {
        isRewardIssuer[issuer] = true;
        emit RewardIssuerAdded(issuer);
    }
    
    /**
     * @dev Remove a reward issuer
     */
    function removeRewardIssuer(address issuer) external onlyOwner {
        isRewardIssuer[issuer] = false;
        emit RewardIssuerRemoved(issuer);
    }
    
    /**
     * @dev Award ScrollGold reward to a student
     */
    function awardReward(
        address recipient,
        uint256 amount,
        string memory reason
    ) external onlyRewardIssuer whenNotPaused {
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be positive");
        require(rewardPool >= amount, "Insufficient reward pool");
        
        rewardPool -= amount;
        lifetimeEarned[recipient] += amount;
        
        _transfer(address(this), recipient, amount);
        
        emit RewardAwarded(recipient, amount, reason);
    }
    
    /**
     * @dev Grant scholarship to a student
     */
    function grantScholarship(
        address recipient,
        uint256 amount,
        string memory program
    ) external onlyRewardIssuer whenNotPaused {
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be positive");
        require(scholarshipPool >= amount, "Insufficient scholarship pool");
        
        scholarshipPool -= amount;
        lifetimeEarned[recipient] += amount;
        
        _transfer(address(this), recipient, amount);
        
        emit ScholarshipGranted(recipient, amount, program);
    }
    
    /**
     * @dev Process tuition payment
     */
    function payTuition(
        uint256 amount,
        string memory courseId
    ) external whenNotPaused {
        require(amount > 0, "Amount must be positive");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        lifetimeSpent[msg.sender] += amount;
        
        // Transfer to contract (can be redistributed)
        _transfer(msg.sender, address(this), amount);
        
        // Add to reward pool for redistribution
        rewardPool += amount;
        
        emit TuitionPaid(msg.sender, amount, courseId);
    }
    
    /**
     * @dev Fund reward pool
     */
    function fundRewardPool(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be positive");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        _transfer(msg.sender, address(this), amount);
        rewardPool += amount;
        
        emit PoolFunded("Reward", amount);
    }
    
    /**
     * @dev Fund scholarship pool
     */
    function fundScholarshipPool(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be positive");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        _transfer(msg.sender, address(this), amount);
        scholarshipPool += amount;
        
        emit PoolFunded("Scholarship", amount);
    }
    
    /**
     * @dev Mint new tokens (respects max supply)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }
    
    /**
     * @dev Burn tokens and track
     */
    function burn(uint256 amount) public override {
        super.burn(amount);
        totalBurned += amount;
    }
    
    /**
     * @dev Burn tokens from address (with approval)
     */
    function burnFrom(address account, uint256 amount) public override {
        super.burnFrom(account, amount);
        totalBurned += amount;
    }
    
    /**
     * @dev Pause token transfers
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Get pool balances
     */
    function getPoolBalances() external view returns (
        uint256 reward,
        uint256 scholarship,
        uint256 reserve,
        uint256 burned
    ) {
        return (rewardPool, scholarshipPool, reservePool, totalBurned);
    }
    
    /**
     * @dev Get user statistics
     */
    function getUserStats(address user) external view returns (
        uint256 balance,
        uint256 earned,
        uint256 spent
    ) {
        return (balanceOf(user), lifetimeEarned[user], lifetimeSpent[user]);
    }
    
    /**
     * @dev Override transfer to add pause functionality
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
}
