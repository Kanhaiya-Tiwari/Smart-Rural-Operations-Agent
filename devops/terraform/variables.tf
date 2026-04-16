variable "aws_region" {
  type    = string
  default = "us-east-2"
}

variable "project_name" {
  type    = string
  default = "sroa"
}

variable "ssh_cidr" {
  type    = string
  default = "0.0.0.0/0"
}

variable "ami_id" {
  type        = string
  description = "EC2 AMI ID (Ubuntu 22.04 / Amazon Linux 2023 recommended)"
}

variable "instance_type" {
  type    = string
  default = "t3.large"
}

variable "key_name" {
  type        = string
  description = "Existing AWS key pair name"
}

variable "dockerhub_username" {
  type        = string
  description = "DockerHub username"
}

variable "dockerhub_password" {
  type        = string
  description = "DockerHub password/token"
  sensitive   = true
}
