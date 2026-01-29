terraform {
  required_version = ">= 1.4"

  required_providers {
    local = {
      source = "hashicorp/local"
      version = ">= 2.0.0"
    }
  }
}

resource "local_file" "sprint2_dummy" {
  content  = "Mentora Sprint 2 Terraform Dummy Resource"
  filename = "${path.module}/dummy.txt"
}
