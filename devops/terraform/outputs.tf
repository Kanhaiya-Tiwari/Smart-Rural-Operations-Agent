output "default_vpc_id" {
  value = data.aws_vpc.default.id
}

output "default_public_subnet_ids" {
  value = sort(data.aws_subnets.default.ids)
}

output "existing_instances" {
  description = "Number of existing instances found"
  value       = length(data.aws_instances.existing.ids)
}

output "ec2_public_ip" {
  description = "EC2 instance public IP"
  value       = length(data.aws_instances.existing.ids) > 0 ? data.aws_instance.existing_app[0].public_ip : aws_eip.app[0].public_ip
}

output "ec2_public_dns" {
  description = "EC2 instance public DNS"
  value       = length(data.aws_instances.existing.ids) > 0 ? data.aws_instance.existing_app[0].public_dns : aws_instance.app[0].public_dns
}
