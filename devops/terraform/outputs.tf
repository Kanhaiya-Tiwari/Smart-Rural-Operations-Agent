output "default_vpc_id" {
  value = data.aws_vpc.default.id
}

output "default_public_subnet_ids" {
  value = sort(data.aws_subnets.default.ids)
}

output "ec2_public_ip" {
  description = "EC2 instance public IP"
  value       = aws_eip.app.public_ip
}

output "ec2_public_dns" {
  description = "EC2 instance public DNS"
  value       = aws_instance.app.public_dns
}
