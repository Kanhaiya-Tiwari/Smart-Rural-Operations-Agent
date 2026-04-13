variable "aws_region" {
  type    = string
  default = "ap-south-1"
}

variable "project_name" {
  type    = string
  default = "sroa"
}

variable "vpc_cidr" {
  type    = string
  default = "10.20.0.0/16"
}

variable "public_subnet_cidr" {
  type    = string
  default = "10.20.1.0/24"
}

variable "availability_zone" {
  type    = string
  default = "ap-south-1a"
}

variable "ssh_cidr" {
  type    = string
  default = "0.0.0.0/0"
}

variable "ami_id" {
  type        = string
  description = "EC2 AMI ID"
}

variable "instance_type" {
  type    = string
  default = "t3.medium"
}

variable "key_name" {
  type        = string
  description = "Existing AWS key pair name"
}
