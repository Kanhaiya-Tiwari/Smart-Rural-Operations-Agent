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

module "vpc" {
  source               = "./modules/vpc"
  vpc_cidr             = var.vpc_cidr
  public_subnet_cidr   = var.public_subnet_cidr
  availability_zone    = var.availability_zone
  project_name         = var.project_name
}

module "security_group" {
  source       = "./modules/security_group"
  vpc_id       = module.vpc.vpc_id
  project_name = var.project_name
  ssh_cidr     = var.ssh_cidr
}

module "ec2" {
  source              = "./modules/ec2"
  project_name        = var.project_name
  ami_id              = var.ami_id
  instance_type       = var.instance_type
  subnet_id           = module.vpc.public_subnet_id
  security_group_id   = module.security_group.security_group_id
  key_name            = var.key_name
}
