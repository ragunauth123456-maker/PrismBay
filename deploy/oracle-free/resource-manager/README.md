# Oracle Resource Manager: PrismBay Always Free stack

This ZIP is a complete Terraform **configuration** for a new OCI Free Tier account, not a running VM. OCI Resource Manager is itself eligible for Always Free. The fixed VM uses one A1 OCPU, 6 GB RAM and a 50 GB boot disk, plus a VCN, subnet and restricted SSH rule. Verify your tenancy's current free-resource usage before applying: a paid tenancy might charge for use above available free allowances.

## The one-time Oracle account authorization

1. Register or sign into your own OCI Free Tier tenancy at https://cloud.oracle.com/ . Complete Oracle's identity/payment verification yourself. Do **not** share your password, payment details, MFA codes, SSH private key or Oracle API key.
2. In Oracle Console select the tenancy's **home region**. Check available A1 Free Tier allowance and the 200 GB shared block-storage quota. If A1 capacity is unavailable, try another availability domain within the home region; do not switch to paid instances.
3. On K1, check for an existing public key at `$HOME/.ssh/id_ed25519.pub`; if one is missing create an SSH key locally and retain the private key on K1. Obtain your current public IPv4 address and append `/32`.
4. Oracle Console > Developer Services > Resource Manager > Stacks > Create stack > My configuration > .Zip file. Upload `resource-manager-stack.zip` from this directory.
5. In the variables form enter `tenancy_ocid`, `compartment_ocid` (root tenancy OCID works if permitted), `region` (HOME region), `ssh_public_key`, `admin_ip_cidr`, and `availability_domain_index=0`. Do not create paid network gateways or extra block volumes.
6. Select **Plan**, inspect the requested resources, confirm the VM shape and free quotas, and select **Apply** only when the plan is within your remaining Always Free allowance.
7. After Apply succeeds, note the VM's public IP and SSH in as the Ubuntu default user from K1; wait for cloud-init to finish using `cloud-init status --wait`.

## Private n8n activation

On the VM, enroll Tailscale into your own tailnet using its official Linux installer and `sudo tailscale up`; this requires your sign-in. Turn on MagicDNS and HTTPS in the tailnet admin settings if not already enabled. Then run `sudo bash /opt/prismbay/source/deploy/oracle-free/activate.sh`. This generates two new private secrets locally (never in GitHub), starts n8n and PostgreSQL, checks localhost health and configures private Tailscale HTTPS. It deliberately does **not** enable public Funnel or publish any social posts.

Open the Tailscale HTTPS n8n address on your iPad Pro. Import K1 workflows only after testing the error workflow and creating new credentials. Disable each old K1 schedule before enabling its cloud counterpart to prevent duplicate commercial actions. Keep Remote Desktop Commander on K1.

The package cannot be applied until an OCI tenancy is authenticated. Its software cannot bypass account verification, home-region capacity, quota or tailnet enrollment.
