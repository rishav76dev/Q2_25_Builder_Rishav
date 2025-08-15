use anchor_lang::prelude::*;

pub mod instructions;
pub mod state;


pub use instructions::*;
pub use state::*;

declare_id!("GGkCBhDqweeCQbJRddw5dogQYCZVDiJbjkg9KgNu631k");

#[program]
pub mod escrow_anchor {
    use super::*;

    pub fn make(ctx: Context<Make>, seed: u64, receive_amount: u64, deposit_amount: u64) -> Result<()> {
        //Context<Make> creates the account for deposit
        // We deposit first because Solana transactions are atomic:
        // - If the token transfer (a CPI) fails, the entire transaction is rolled back.
        // - This prevents writing escrow state before a risky operation.
        // - No rent is wasted since account creation is reverted on failure.
        // - This ordering avoids partial updates and ensures clean rollback.
        ctx.accounts.deposit(deposit_amount)?;
        ctx.accounts.init_escrow(seed, receive_amount, &ctx.bumps)?;
        Ok(())
    }


    pub fn take(ctx: Context<Take>,) -> Result<()> {
        ctx.accounts.transfer_to_maker()?;
        ctx.accounts.transfer_to_taker()?;
        ctx.accounts.close_vault()?;

        Ok(())

    }

    pub fn refund(ctx: Context<Refund>) -> Result<()> {
        ctx.accounts.refund()?;
        ctx.accounts.close()?;
        Ok(())
    }
}
