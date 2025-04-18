#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;


pub mod instructions;
pub mod state;

pub use instructions::*;

declare_id!("GGkCBhDqweeCQbJRddw5dogQYCZVDiJbjkg9KgNu631k");

#[program]
pub mod escrow {
    use super::*;

    pub fn make(ctx: Context<Make>, seed: u64, deposit: u64) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
