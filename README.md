# Worldvue Troubleshooting KB

**Live URL: https://worldvue-kb.vercel.app**

A centralized troubleshooting knowledge base for the Worldvue Advanced Deployment Team. Use it to look up resolved issues, submit new cases from the field, and keep the team's collective knowledge growing.

---

## Who Is This For?

- **Activation Agents** — Look up issues and troubleshooting steps during live deployments
- **Deployment Engineers** — Submit resolved cases and review field submissions
- **Advanced Deployment Team** — Manage and approve the growing knowledge base

---

## How to Use the Knowledge Base

### 1. Browse & Search

Open **https://worldvue-kb.vercel.app** in any browser — no login required.

**Search bar** (top of page): Type any keyword — symptom, device name, error description, or VLAN — and results filter instantly.

> Example searches: `VLAN 850`, `SmartBox`, `err-disabled`, `Chromecast`, `FTG lineup`

**Category filter** (left sidebar): Narrow results to a specific area:
| Category | What It Covers |
|---|---|
| Networking/Connectivity | Switch config, trunk ports, WAN/LAN uplinks, PFSense issues |
| VLAN | VLAN 850 content path, VLAN tagging, management VLAN issues |
| FTG | HUB Server, channel lineup, LG Pro:Centric, FTG clone failures |
| OTT | OTT streaming, 4K encoder, content VLAN, app loading failures |
| Native Casting | Chromecast (WCC), mDNS, client isolation, cast session drops |
| Hardware | Switch port errors, err-disabled, SmartBox, device not reachable |

**Platform filter** (left sidebar): Filter by deployment type:
- **Platform 1** — No LG Pro:Centric Server
- **Platform 2** — With LG Pro:Centric Server PCS400/500
- **Custom Build** — Any device combination

---

### 2. Read an Article

Click any card to expand it. Each article contains:

| Section | What You'll Find |
|---|---|
| **Severity** | High / Medium / Low — how critical the issue is |
| **Symptom** | What the technician observed on site |
| **Root Cause** | What actually caused the issue |
| **Troubleshooting Steps** | Numbered steps to diagnose and resolve — follow in order |
| **Resolution** | What fixed it — the confirmed solution |

---

### 3. Submit a New Case

Found and resolved an issue not in the KB? Submit it so the whole team benefits.

1. Click **Submit Case** in the top navigation
2. Fill in all required fields:
   - **Category** — Pick the closest match
   - **Severity** — High (site down / no service), Medium (partial impact), Low (minor issue)
   - **Platform(s)** — Check all that apply
   - **Issue Title** — Short, descriptive (e.g. "SmartBox not pulling DHCP on G1/0/23")
   - **Symptom** — What you saw on site
   - **Root Cause** — What you determined caused it
   - **Troubleshooting Steps** — One step per line, in the order you'd follow them
   - **Resolution** — What fixed it
   - **Your Name** — Required for attribution
   - **Site Code** — Optional but helpful for reference
3. Click **Submit for Review**

Your submission goes into a **pending queue** and is reviewed by an Advanced Deployment Engineer before going live. You'll see a confirmation message when it's submitted.

---

### 4. Review Queue (Engineers Only)

The Review Queue is where field-submitted cases are approved before being added to the live KB.

1. Click **Review Queue** in the top navigation
2. A badge shows how many cases are waiting
3. Read through each submission carefully:
   - Verify the troubleshooting steps are accurate and complete
   - Confirm the root cause and resolution are correct
4. Click **✓ Approve & Add to KB** to publish the article
5. Click **✕ Reject** to discard a submission that is incomplete or inaccurate

Approved articles appear immediately in the Knowledge Base for the whole team.

---

### 5. Stats Dashboard

Click **Stats** in the top navigation to see:
- Total number of KB articles
- Breakdown by severity (High / Medium / Low)
- Article count per category

---

## Severity Guide

| Level | When to Use |
|---|---|
| **High** | Site is down, no FTG/OTT service, complete failure |
| **Medium** | Partial service impact, one platform or device affected |
| **Low** | Minor issue, workaround available, cosmetic or edge case |

---

## Tips for Good Submissions

- **Be specific in the title** — "CMTS GIGE port not on VLAN 850" is better than "CMTS issue"
- **Write steps you'd actually follow** — If a new tech had to use your steps cold, would they work?
- **Include the exact commands** — e.g. `show run interface G1/0/2` not just "check the port"
- **Note any device-specific behavior** — e.g. "CMTS requires 3-minute restart before testing"
- **Select all applicable platforms** — If the issue can happen on P1 and P2, check both

---

## Technical Stack

| Component | Technology |
|---|---|
| Frontend | React + Vite, hosted on Vercel |
| Database | Supabase (PostgreSQL) |
| Deployment | Auto-deploys from GitHub on every push |
| Repository | github.com/hdactivations/worldvue-kb |

---

## Support & Contact

For issues with the KB tool itself, contact:

**Armando Rodriguez** — Advanced Deployment Team  
arodriguez@worldvue.com

---

*Worldvue Advanced Deployment Team · Troubleshooting KB · Built June 2026*
