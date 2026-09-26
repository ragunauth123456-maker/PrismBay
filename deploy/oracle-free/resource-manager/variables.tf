variable "region" {
  description = "OCI home region only; other regions might incur charges."
  type        = string
  validation {
    condition     = length(trimspace(var.region)) > 4
    error_message = "Choose your tenancy HOME region."
  }
}
variable "tenancy_ocid" {
  description = "OCI tenancy/root-compartment OCID."
  type        = string
  validation {
    condition     = startswith(var.tenancy_ocid, "ocid1.tenancy.")
    error_message = "Enter the OCI tenancy OCID."
  }
}
variable "compartment_ocid" {
  description = "Compartment for the VM and networking."
  type        = string
  validation {
    condition     = startswith(var.compartment_ocid, "ocid1.compartment.") || startswith(var.compartment_ocid, "ocid1.tenancy.")
    error_message = "Enter a compartment or root tenancy OCID."
  }
}
variable "ssh_public_key" {
  description = "OpenSSH public key from K1, never the private key."
  type        = string
  validation {
    condition     = startswith(trimspace(var.ssh_public_key), "ssh-ed25519 ") || startswith(trimspace(var.ssh_public_key), "ssh-rsa ")
    error_message = "A valid OpenSSH public key is required."
  }
}
variable "admin_ip_cidr" {
  description = "Your current public IPv4 address with /32; the only SSH ingress source."
  type        = string
  validation {
    condition     = can(cidrhost(var.admin_ip_cidr, 0)) && endswith(var.admin_ip_cidr, "/32")
    error_message = "Use a single-address IPv4 CIDR, for example 203.0.113.10/32."
  }
}
variable "availability_domain_index" {
  description = "Availability domain within your home region; 0 initially."
  type        = number
  default     = 0
  validation {
    condition     = var.availability_domain_index >= 0 && var.availability_domain_index <= 2 && floor(var.availability_domain_index) == var.availability_domain_index
    error_message = "Choose 0, 1, or 2."
  }
}
