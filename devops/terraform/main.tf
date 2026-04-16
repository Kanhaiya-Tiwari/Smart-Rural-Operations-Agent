terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

data "aws_vpc" "default" {
  default = true
}

data "aws_security_groups" "existing" {
  filter {
    name   = "group-name"
    values = ["${var.project_name}-sg"]
  }
}

data "aws_instances" "existing" {
  filter {
    name   = "tag:Name"
    values = ["${var.project_name}-kind-cluster*"]
  }
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
  filter {
    name   = "default-for-az"
    values = ["true"]
  }
}

module "security_group" {
  count        = length(data.aws_security_groups.existing.ids) > 0 ? 0 : 1
  source       = "./modules/security_group"
  vpc_id       = data.aws_vpc.default.id
  project_name = var.project_name
  ssh_cidr     = var.ssh_cidr
}

# Use existing security group if it exists
data "aws_security_group" "existing_sg" {
  count = length(data.aws_security_groups.existing.ids) > 0 ? 1 : 0
  id    = data.aws_security_groups.existing.ids[0]
}

resource "aws_instance" "app" {
  count                  = length(data.aws_instances.existing.ids) > 0 ? 0 : 1
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = var.key_name
  subnet_id              = data.aws_subnets.default.ids[0]
  vpc_security_group_ids = length(data.aws_security_groups.existing.ids) > 0 ? [data.aws_security_group.existing_sg[0].id] : [module.security_group[0].security_group_id]
  user_data              = templatefile("${path.module}/user-data.sh", {
    dockerhub_username = var.dockerhub_username
    dockerhub_password = var.dockerhub_password
  })

  tags = {
    Name = "${var.project_name}-kind-cluster"
  }
}

resource "aws_eip" "app" {
  count    = length(data.aws_instances.existing.ids) > 0 ? 0 : 1
  instance = aws_instance.app[0].id
  domain   = "vpc"

  tags = {
    Name = "${var.project_name}-eip"
  }
}

# Get existing instance details if they exist
data "aws_instance" "existing_app" {
  count = length(data.aws_instances.existing.ids) > 0 ? 1 : 0
  instance_id = data.aws_instances.existing.ids[0]
}
