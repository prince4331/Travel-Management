import 'reflect-metadata';
import { AppDataSource } from '../data-source';
import { Group } from '../groups/group.entity';
import { GroupMember } from '../groups/group-member.entity';
import { Expense } from '../expenses/expense.entity';

async function fixExpenseSplits() {
  await AppDataSource.initialize();

  const groupRepo = AppDataSource.getRepository(Group);
  const memberRepo = AppDataSource.getRepository(GroupMember);
  const expenseRepo = AppDataSource.getRepository(Expense);

  // Get all groups
  const groups = await groupRepo.find();

  for (const group of groups) {
    console.log(`\n🔧 Fixing splits for group: ${group.title}`);
    
    // Get all active members in this group
    const members = await memberRepo.find({
      where: { group: { id: group.id }, status: 'active' },
      relations: ['user'],
    });

    console.log(`   Members: ${members.length}`);

    if (members.length === 0) {
      console.log('   ⚠️  No members, skipping...');
      continue;
    }

    // Get all expenses for this group
    const expenses = await expenseRepo.find({
      where: { group: { id: group.id } },
    });

    console.log(`   Expenses: ${expenses.length}`);

    // Recalculate splits for each expense
    for (const expense of expenses) {
      const memberCount = members.length;
      const amount = Number(expense.amount);
      
      // Calculate equal split with rounding
      const splitAmount = Math.floor((amount / memberCount) * 100) / 100;
      
      // Create new splits array
      const newSplits = members.map((member, index) => {
        const isLast = index === memberCount - 1;
        const memberAmount = isLast
          ? Number((amount - (splitAmount * (memberCount - 1))).toFixed(2)) // Last member gets remainder
          : Number(splitAmount);
        
        return {
          memberId: member.user.id,
          amount: memberAmount,
        };
      });

      // Show the change
      console.log(`   📊 Expense: "${expense.title}" ($${amount})`);
      console.log(`      Old splits:`, expense.splits);
      console.log(`      New splits:`, newSplits);

      // Update expense splits
      expense.splits = newSplits;
      await expenseRepo.save(expense);
      console.log(`      ✅ Updated!`);
    }

    console.log(`   ✅ Group "${group.title}" fixed!`);
  }

  await AppDataSource.destroy();
  console.log('\n✅ All expense splits fixed successfully!');
}

fixExpenseSplits().catch((error) => {
  console.error('❌ Failed to fix expense splits', error);
  process.exit(1);
});
