#![allow(unexpected_cfgs)]

use anchor_lang::prelude::CpiContext;
use anchor_spl::token::TransferChecked;



#[derive(Accounts)]
pub struct Refund<'info> {
    #[account(mut)]
    pub maker: Signer<'info>,
    #[account(
        mint::token_program = token_program
    )]

    pub mint_a: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = mint_a,
    )]

    pub maker_ata_a: InterfaceAccount<'info, TokenAccount>,
    #[account(
        mut,
        close = maker,
        has_one = mint_a,
        has_one = maker,
        seeds = [b"escrow", maker.key().as_ref(), &escrow.seed.to_le_bytes().as_ref()],
        bump = escrow.bump,
    )]
    pub escrow: Account<'info, Escrow>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,

}
    
impl <'info> Refund<'info> {
    pub fn refund_and_close_vault(
        &mut self
    ) ->Result<()> {
        let signer_seeds: [&[&[u8]]] = &[&[
            b"escrow",
            self.maker.to_account_info().key.as_ref(),
            &self.escrow.seed.to_le_bytes()[..],
            &[self.escrow.bump],
        ]];
        let transfer_accounts = TransferChecked {
            from: self.maker_ata_a.to_account_info(),
            mint: self.mint_a.to_account_info(),
            to: self.vault.to_account_info(),
            authority: self.maker.to_account_info(),
           
        };

        let cpi_ctx = CpiContext::new(cpi_program, transfer_accounts);
      
        transfer_checked(
            cpi_ctx,
            self.vault.amount,
            self.mint_a.decimals
        )?;

        let close_accounts = CloseAccount {
            account: self.vault.to_account_info(),
            destination: self.maker.to_account_info(),
            authority: self.maker.to_account_info(),
        };

        let close_cpi_ctx = CpiContext::new_with_signer(self.token_program.to_account_info,
            close_accounts,
             &signer_seeds,
        );
        close_account(
            close_cpi_ctx
        );
        Ok(())
    }
    
}