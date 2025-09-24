# 🍔 NFT-Based Limited-Edition Menu Items

Welcome to a revolutionary way to engage restaurant customers and turn menu items into valuable collectibles! This Web3 project addresses the real-world problem of declining customer loyalty in the food industry by transforming limited-edition menu items into tradable NFTs on the Stacks blockchain. Restaurants can create buzz around seasonal or exclusive dishes, while customers collect, trade, and redeem NFTs for perks like discounts, priority reservations, or exclusive events—boosting repeat visits and community building.

## ✨ Features

🍽️ Mint limited-edition NFTs for menu items with scarcity (e.g., only 100 editions)  
🔄 Trade NFTs on a built-in marketplace with royalties for restaurants  
🎁 Redeem NFTs for real-world perks like discounts or VIP access  
📊 Track ownership and history immutably on the blockchain  
🏆 Community voting for new menu item releases  
🔒 Secure escrow for trades and royalty distribution  
📝 Dynamic metadata for item details, images, and descriptions  
🚫 Prevent unauthorized minting or duplicates  

## 🛠 How It Works

**For Restaurant Owners**  
- Register your restaurant and propose new limited-edition menu items.  
- Mint NFTs via the MintingContract, setting supply limits and perks.  
- Earn royalties automatically on secondary trades through the RoyaltyDistributor.  
- Use the Governance contract to let the community vote on future items.  

**For Customers/Collectors**  
- Browse and mint available NFTs for your favorite menu items.  
- Trade them on the Marketplace with secure escrow.  
- Redeem perks by calling the PerksRedeemer contract (e.g., scan a QR code at the restaurant to verify ownership).  
- View item details and ownership history anytime.  

**Technical Backbone**  
This project is built with Clarity smart contracts on Stacks for secure, efficient execution. It involves 8 interconnected contracts to handle the full lifecycle:  

1. **RestaurantRegistry**: Registers restaurants and authorizes them to create menu items (prevents spam and ensures legitimacy).  
2. **MenuItemNFT**: Core NFT contract for defining and managing ownership of menu item tokens (implements SIP-009 standard).  
3. **MintingContract**: Handles limited-edition minting logic, including supply caps and initial distribution.  
4. **MarketplaceContract**: Facilitates buying, selling, and listing of NFTs with bidding support.  
5. **EscrowContract**: Secures trades by holding funds and NFTs until conditions are met.  
6. **PerksRedeemer**: Verifies NFT ownership and tracks redemptions for real-world perks (integrates with oracles for off-chain validation).  
7. **RoyaltyDistributor**: Automatically calculates and distributes royalties to restaurant owners on secondary sales.  
8. **GovernanceContract**: Enables DAO-style voting for new menu items or project decisions among NFT holders.  

That's it! Launch your restaurant into Web3 and watch customer engagement soar.