output "instance_name" {
  value = oci_core_instance.n8n.display_name
}
output "public_ip" {
  value = oci_core_instance.n8n.public_ip
}
output "ssh_command" {
  value = "ssh ubuntu@${oci_core_instance.n8n.public_ip}"
}
output "n8n_setup" {
  value = "SSH to the VM, complete Tailscale enrollment, then run sudo /opt/prismbay/source/deploy/oracle-free/activate.sh"
}
output "security_note" {
  value = "Only SSH from your supplied /32 is public. n8n is served privately on Tailscale."
}
