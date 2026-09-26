data "oci_identity_availability_domains" "home" {
  compartment_id = var.tenancy_ocid
}
data "oci_core_images" "ubuntu_arm" {
  compartment_id           = var.compartment_ocid
  operating_system         = "Canonical Ubuntu"
  operating_system_version = "24.04"
  shape                    = "VM.Standard.A1.Flex"
  sort_by                  = "TIMECREATED"
  sort_order               = "DESC"
}
locals {
  selected_ad = data.oci_identity_availability_domains.home.availability_domains[var.availability_domain_index].name
}
resource "oci_core_vcn" "prismbay" {
  compartment_id = var.compartment_ocid
  cidr_blocks    = ["10.77.0.0/16"]
  dns_label      = "prismbay"
  display_name   = "prismbay-free-vcn"
}
resource "oci_core_internet_gateway" "prismbay" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.prismbay.id
  enabled        = true
  display_name   = "prismbay-free-internet-gateway"
}
resource "oci_core_route_table" "prismbay" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.prismbay.id
  display_name   = "prismbay-free-route-table"
  route_rules {
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
    network_entity_id = oci_core_internet_gateway.prismbay.id
  }
}
resource "oci_core_security_list" "private_automation" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.prismbay.id
  display_name   = "prismbay-ssh-only"
  ingress_security_rules {
    protocol = "6"
    source   = var.admin_ip_cidr
    tcp_options {
      min = 22
      max = 22
    }
  }
  egress_security_rules {
    protocol    = "all"
    destination = "0.0.0.0/0"
  }
}
resource "oci_core_subnet" "prismbay" {
  compartment_id             = var.compartment_ocid
  vcn_id                     = oci_core_vcn.prismbay.id
  cidr_block                 = "10.77.1.0/24"
  dns_label                  = "automation"
  display_name               = "prismbay-free-subnet"
  prohibit_public_ip_on_vnic = false
  route_table_id             = oci_core_route_table.prismbay.id
  security_list_ids          = [oci_core_security_list.private_automation.id]
}
resource "oci_core_instance" "n8n" {
  compartment_id      = var.compartment_ocid
  availability_domain = local.selected_ad
  shape               = "VM.Standard.A1.Flex"
  display_name        = "PrismBay-Free-n8n"
  # Fixed below Always Free A1 allowance; confirm free capacity and prior usage.
  shape_config {
    ocpus         = 1
    memory_in_gbs = 6
  }
  source_details {
    source_type             = "image"
    source_id               = data.oci_core_images.ubuntu_arm.images[0].id
    boot_volume_size_in_gbs = 50
    boot_volume_vpus_per_gb = 0
  }
  create_vnic_details {
    subnet_id        = oci_core_subnet.prismbay.id
    assign_public_ip = true
    hostname_label   = "prismbay"
  }
  metadata = {
    ssh_authorized_keys = trimspace(var.ssh_public_key)
    user_data           = base64encode(file("${path.module}/cloud-init.yaml"))
  }
}
