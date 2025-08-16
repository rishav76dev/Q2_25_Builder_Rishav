use anchor_lang::prelude::*;

#[account]
pub struct Marketplace {
    pub key: Pubkey,        // PDA of this marketplace
    pub admin: Pubkey,      // marketplace admin
    pub fee: u16,           // fee percentage or basis points
    pub bump: u8,
    pub treasury_bump: u8,  // PDA for treasury
    pub rewards_bump: u8,   // PDA for rewards
    pub name: String,       // marketplace name
}

impl Space for Marketplace {
    const INIT_SPACE: usize = 8  // discriminator
        + 32  // key
        + 32  // admin
        + 2   // fee
        + 1   // bump
        + 1   // treasury_bump
        + 1   // rewards_bump
        + 4 + 32; // string (4-byte prefix + 32 bytes content)
}
