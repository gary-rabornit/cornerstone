/**
 * Send a Slack notification when a deal is won.
 * This is called from both automatic stage advancement and manual drag-and-drop.
 *
 * Uses the Slack webhook URL from the environment variable SLACK_DEAL_WON_WEBHOOK.
 * If not set, logs to console instead.
 */

const SLACK_WEBHOOK_URL = process.env.SLACK_DEAL_WON_WEBHOOK

export async function notifyDealWon({
  companyName,
  contactName,
  value,
  proposalTitle,
  ownerName,
  rabornCompany,
}: {
  companyName: string
  contactName: string
  value: number
  proposalTitle?: string
  ownerName: string
  rabornCompany: string
}) {
  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(value)

  const message = [
    `:tada: *Deal Won!*`,
    ``,
    `*${companyName}* — ${formattedValue}`,
    `Contact: ${contactName}`,
    proposalTitle ? `Proposal: ${proposalTitle}` : null,
    `Company: ${rabornCompany}`,
    `Owner: ${ownerName}`,
  ]
    .filter(Boolean)
    .join('\n')

  if (SLACK_WEBHOOK_URL) {
    try {
      const res = await fetch(SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message }),
      })
      if (!res.ok) {
        console.error('[Slack] Webhook failed:', res.status, await res.text())
      } else {
        console.log(`[Slack] Deal won notification sent for ${companyName}`)
      }
    } catch (err) {
      console.error('[Slack] Error sending webhook:', err)
    }
  } else {
    console.log('\n' + '='.repeat(60))
    console.log('[Slack Preview] No SLACK_DEAL_WON_WEBHOOK set:')
    console.log(message)
    console.log('='.repeat(60) + '\n')
  }
}
